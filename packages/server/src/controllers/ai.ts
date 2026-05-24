import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { chatCompletion, chatCompletionStream, buildUserContext } from '../utils/aiClient.js';
import { getDashboardData } from '../services/dashboard.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AIChatInput } from '@kvitifai/shared';

async function getUserContext(userId: string) {
  const dashboard = await getDashboardData(userId);
  const lastCraving = await prisma.progressLog.findFirst({
    where: { userId, type: 'CRAVING' },
    orderBy: { date: 'desc' },
  });

  return buildUserContext({
    daysWithoutSmoking: dashboard.daysWithoutSmoking,
    moneySaved: dashboard.moneySaved,
    lastCravingLevel: lastCraving?.cravingLevel ?? undefined,
    streak: dashboard.streak,
  });
}

async function ensureConversation(userId: string, conversationId?: string) {
  if (conversationId) {
    const conv = await prisma.aIConversation.findFirst({ where: { id: conversationId, userId } });
    if (!conv) throw new AppError(404, 'Диалог не найден');
    return conv;
  }
  return prisma.aIConversation.create({ data: { userId } });
}

async function generateTitle(firstUserMessage: string): Promise<string> {
  try {
    const response = await chatCompletion([
      {
        role: 'user',
        content: `Сформулируй очень короткий заголовок (3–6 слов) для диалога с пользователем, который начинается так:\n\n"${firstUserMessage}"\n\nОтветь только заголовком на русском, без кавычек и без markdown. Сохрани правильную пунктуацию (точки, запятые, вопросительный знак, если уместно). Если в заголовке речь о тяге к сигаретам — пиши «тяга к курению», а не просто «тяга».`,
      },
    ]);
    const cleaned = response
      .replace(/[«»"`*_]/g, '')
      .replace(/^[\s\-—]+|[\s\-—]+$/g, '')
      .split('\n')[0]
      ?.trim() ?? '';
    if (!cleaned) return firstUserMessage.slice(0, 40);
    return cleaned.slice(0, 80);
  } catch {
    return firstUserMessage.slice(0, 40);
  }
}

export const chat: RequestHandler = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body as AIChatInput;
    const userId = req.userId!;

    const conversation = await ensureConversation(userId, conversationId);
    const context = await getUserContext(userId);

    const past = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', conversation.id);
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ conversationId: conversation.id })}\n\n`);

    const messages = [
      { role: 'user' as const, content: context },
      ...past.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    let fullResponse = '';
    try {
      for await (const chunk of chatCompletionStream(messages)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    } catch (streamErr) {
      console.error('AI stream error:', streamErr);
      res.write(`data: ${JSON.stringify({ error: 'AI временно недоступен' })}\n\n`);
    }

    if (fullResponse) {
      await prisma.aIMessage.create({
        data: { conversationId: conversation.id, role: 'assistant', content: fullResponse },
      });
    }

    if (past.length === 0 && fullResponse) {
      const title = await generateTitle(message);
      await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { title, updatedAt: new Date() },
      });
      res.write(`data: ${JSON.stringify({ title })}\n\n`);
    } else {
      await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    await prisma.aIInteraction.create({
      data: { userId, userMessage: message, aiResponse: fullResponse, type: 'CHAT' },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    if (!res.headersSent) next(err);
    else { try { res.end(); } catch { /* noop */ } }
  }
};

export const listConversations: RequestHandler = async (req, res, next) => {
  try {
    const items = await prisma.aIConversation.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json(
      items.map((c) => ({
        id: c.id,
        title: c.title,
        preview: c.messages[0]?.content.slice(0, 120) ?? '',
        updatedAt: c.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const createConversation: RequestHandler = async (req, res, next) => {
  try {
    const conv = await prisma.aIConversation.create({ data: { userId: req.userId! } });
    res.status(201).json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: [],
    });
  } catch (err) {
    next(err);
  }
};

export const getConversation: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const conv = await prisma.aIConversation.findFirst({
      where: { id, userId: req.userId! },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) {
      res.status(404).json({ error: 'Диалог не найден' });
      return;
    }
    res.json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const renameConversation: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { title } = req.body as { title: string };
    const result = await prisma.aIConversation.updateMany({
      where: { id, userId: req.userId! },
      data: { title },
    });
    if (result.count === 0) {
      res.status(404).json({ error: 'Диалог не найден' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const result = await prisma.aIConversation.deleteMany({
      where: { id, userId: req.userId! },
    });
    if (result.count === 0) {
      res.status(404).json({ error: 'Диалог не найден' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const cravingSupport: RequestHandler = async (req, res, next) => {
  try {
    const context = await getUserContext(req.userId!);
    const response = await chatCompletion([
      { role: 'user', content: context },
      {
        role: 'user',
        content:
          'Я сейчас очень хочу закурить. Помоги мне справиться с этим желанием. Дай конкретный совет, что делать прямо сейчас.',
      },
    ]);

    await prisma.aIInteraction.create({
      data: {
        userId: req.userId!,
        userMessage: 'Хочу курить',
        aiResponse: response,
        type: 'CRAVING_SUPPORT',
      },
    });

    res.json({ message: response });
  } catch (err) {
    next(err);
  }
};

export const motivation: RequestHandler = async (req, res, next) => {
  try {
    const context = await getUserContext(req.userId!);
    const response = await chatCompletion([
      { role: 'user', content: context },
      { role: 'user', content: 'Дай мне мотивирующее сообщение на сегодня. Коротко и вдохновляюще.' },
    ]);

    res.json({ message: response });
  } catch (err) {
    next(err);
  }
};

export const recommendations: RequestHandler = async (req, res, next) => {
  try {
    const context = await getUserContext(req.userId!);
    const recentLogs = await prisma.progressLog.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      take: 7,
    });

    const logsContext = recentLogs
      .map((l) => `${l.type} | тяга: ${l.cravingLevel ?? '-'} | настроение: ${l.mood ?? '-'} | сигарет: ${l.cigarettesSmoked}`)
      .join('\n');

    const response = await chatCompletion([
      { role: 'user', content: context },
      {
        role: 'user',
        content: `Вот мои последние записи:\n${logsContext}\n\nДай 3 персонализированные рекомендации на основе моих данных. Формат: JSON массив [{title, description}].`,
      },
    ]);

    res.json({ message: response });
  } catch (err) {
    next(err);
  }
};
