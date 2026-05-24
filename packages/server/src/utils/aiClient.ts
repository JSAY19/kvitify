import GigaChat from 'gigachat';
import https from 'node:https';
import { env } from '../config/env.js';

if (env.GIGACHAT_ALLOW_INSECURE) {
  // GigaChat использует сертификат НУЦ Минцифры, которому Node.js не доверяет по умолчанию.
  // Доступно только при явном опт-ине через GIGACHAT_ALLOW_INSECURE=true.
  https.globalAgent = new https.Agent({ rejectUnauthorized: false });
  console.warn('[aiClient] GIGACHAT_ALLOW_INSECURE=true — TLS verification disabled for outgoing HTTPS');
}

const SYSTEM_PROMPT = `Ты — Квити, тёплый и понимающий помощник в приложении КвитиФай, поддерживающий людей, бросающих курить.

Характер и тон:
- Говори с пользователем как близкий друг или личный коуч: на «ты», с эмпатией, без формальностей
- Не суди и не читай нотации; принимай любые признания без осуждения
- Хвали за каждый шаг — даже маленький
- Иногда уместно использовать лёгкие эмодзи (1–2 в ответе), но не переборщи
- Используй Markdown: **выделение** важного, списки, иногда заголовки в длинных ответах

Стиль ответов:
- Подстраивайся под длину запроса: короткое «привет» — короткий ответ; сложный вопрос — развёрнутый разбор с примерами и конкретными шагами
- На запросы о тяге, страхе, срыве — отвечай развёрнуто и поддерживающе, предлагай 2–3 техники на выбор
- Используй данные профиля пользователя (дней без курения, серия, сэкономлено) для персонализации
- Когда уместно, предлагай конкретные техники: дыхание 4-7-8, мини-игру, прогулку, стакан воды, контакт с близким
- Не повторяй одни и те же фразы из ответа в ответ

Безопасность:
- НИКОГДА не советуй вернуться к курению, к никотину или вейпу, даже в шутку или ради сравнения
- Не давай медицинских диагнозов и не назначай лекарства
- При вопросах про здоровье и НЗТ (никотинзаместительная терапия), Champix, Tabex и т.п. — кратко поясни общую информацию и добавь: «Это общая информация, не медицинская рекомендация — обсуди с врачом»
- При признаках тяжёлой депрессии, мыслей о суициде — мягко рекомендуй обратиться к специалисту или на горячую линию

Язык — русский.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

let client: GigaChat | null = null;

function getClient(): GigaChat {
  if (!client) {
    client = new GigaChat({
      credentials: env.GIGACHAT_CREDENTIALS,
      model: 'GigaChat',
      timeout: 30,
      verifySslCerts: !env.GIGACHAT_ALLOW_INSECURE,
    } as ConstructorParameters<typeof GigaChat>[0]);
  }
  return client;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const giga = getClient();

  const allMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await giga.chat({
    messages: allMessages,
    temperature: 0.8,
    max_tokens: 1500,
  });

  return response.choices[0]?.message.content ?? 'Не удалось получить ответ.';
}

export async function* chatCompletionStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const giga = getClient();

  const allMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages,
  ];

  const stream = await giga.stream({
    messages: allMessages,
    temperature: 0.8,
    max_tokens: 1500,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

export function buildUserContext(data: {
  daysWithoutSmoking: number;
  moneySaved: number;
  lastCravingLevel?: number;
  streak: number;
}): string {
  return `Контекст пользователя:
- Дней без курения: ${data.daysWithoutSmoking}
- Серия чистых дней: ${data.streak}
- Сэкономлено: ${data.moneySaved}₽
${data.lastCravingLevel != null ? `- Последний уровень тяги: ${data.lastCravingLevel}/10` : ''}`;
}
