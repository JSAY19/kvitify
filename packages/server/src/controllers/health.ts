import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { getDashboardData } from '../services/dashboard.js';
import { chatCompletion } from '../utils/aiClient.js';

const HEALTH_INSTRUCTIONS = `Сгенерируй для меня короткий, стильный отчёт о моём здоровье в формате Markdown.

Правила:
- Длина: 3 коротких абзаца (~70–120 слов суммарно)
- Тон тёплый, на «ты», как близкий друг; без воды и канцелярита
- Подсвечивай ключевые цифры через **bold**
- Уместно 1–2 эмодзи на весь ответ
- Не упоминай врачей и лекарства; не предлагай вернуться к курению
- Не вставляй заголовки и списки — только связные абзацы

Структура:
1) Что уже произошло в теле за этот срок (конкретно: лёгкие, сосуды, вкус/обоняние, сон).
2) Что значат сэкономленные деньги и не выкуренные сигареты — в живом примере.
3) Короткий мотивирующий вывод про следующий шаг.`;

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const getDailyHealth: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId!;
    const today = startOfUtcDay(new Date());

    const existing = await prisma.dailyHealthReport.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing) {
      res.json({
        date: existing.date.toISOString(),
        content: existing.content,
        stats: existing.stats,
        cached: true,
      });
      return;
    }

    const data = await getDashboardData(userId);
    const stats = {
      daysWithoutSmoking: data.daysWithoutSmoking,
      streak: data.streak,
      moneySaved: data.moneySaved,
      cigarettesAvoided: data.cigarettesAvoided,
    };

    const userPrompt = `Мои данные на сегодня:
- Дней без курения: ${stats.daysWithoutSmoking}
- Серия чистых дней: ${stats.streak}
- Сэкономлено: ${stats.moneySaved}₽
- Не выкурено сигарет: ${stats.cigarettesAvoided}

${HEALTH_INSTRUCTIONS}`;

    let content: string;
    try {
      content = await chatCompletion([{ role: 'user', content: userPrompt }]);
    } catch (aiErr) {
      const e = aiErr as { code?: string; message?: string; response?: { status?: number; data?: unknown } };
      console.error('[health] AI error:', {
        code: e?.code,
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      const isCert = e?.code === 'SELF_SIGNED_CERT_IN_CHAIN' || e?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
      res.status(503).json({
        error: isCert
          ? 'GigaChat: сертификат НУЦ Минцифры не доверен. Перезапусти сервер с GIGACHAT_ALLOW_INSECURE=true.'
          : 'AI временно недоступен. Попробуй обновить позже.',
        stats,
        date: today.toISOString(),
      });
      return;
    }

    const saved = await prisma.dailyHealthReport.upsert({
      where: { userId_date: { userId, date: today } },
      update: { content, stats },
      create: { userId, date: today, content, stats },
    });

    res.json({
      date: saved.date.toISOString(),
      content: saved.content,
      stats: saved.stats,
      cached: false,
    });
  } catch (err) {
    next(err);
  }
};
