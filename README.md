# КвитиФай (Kvitify)

Прогрессивное веб-приложение (PWA) для поддержки отказа от курения: персональный трекинг, мотивация, дыхательные практики и консультационный диалог с ИИ на базе [GigaChat](https://developers.sber.ru/docs/ru/gigachat/overview).

Репозиторий: [github.com/JSAY19/kvitify](https://github.com/JSAY19/kvitify)

## О приложении

КвитиФай помогает пользователю осознанно пройти путь отказа от курения:

- вести профиль курения и видеть прогресс (дни без сигарет, условная экономия, серия отметок);
- отмечать состояние каждый день и фиксировать эпизоды тяги;
- получать совет дня и подсказки по восстановлению здоровья;
- пользоваться таймером и дыхательными упражнениями в моменты тяги;
- общаться с ИИ-помощником с учётом контекста прогресса;
- вести дневник, получать достижения и баллы;
- участвовать в ленте сообщества;
- подписаться на web push-напоминания.

Приложение не является медицинским изделием: показатели носят мотивационный и ориентировочный характер.

## Стек

| Слой | Технологии |
|------|------------|
| Клиент | React 19, Vite, TypeScript, Tailwind CSS, Zustand, PWA (Workbox) |
| Сервер | Node.js, Express, TypeScript, Zod, Prisma |
| БД | PostgreSQL |
| ИИ | GigaChat API (потоковые ответы в чате) |

## Быстрый старт

### Требования

- Node.js 20+
- PostgreSQL 14+
- Учётные данные GigaChat (переменная `GIGACHAT_CREDENTIALS`)

### Установка

```bash
git clone https://github.com/JSAY19/kvitify.git
cd kvitify
npm install
```

### Настройка

```bash
cp .env.example .env
```

Заполните в `.env`:

- `DATABASE_URL` — строка подключения PostgreSQL;
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — случайные строки (не менее 32 символов);
- `GIGACHAT_CREDENTIALS` — ключ доступа к GigaChat.

Опционально: `VAPID_PUBLIC_KEY` и `VAPID_PRIVATE_KEY` для push (`npx web-push generate-vapid-keys`).

### База данных

```bash
npm run db:migrate
npm run db:seed
```

### Запуск в разработке

```bash
npm run dev
```

- Клиент: http://127.0.0.1:5173  
- API: http://127.0.0.1:3001  

### Демо-аккаунт (после seed)

- Email: `demo@kvitifai.app`
- Пароль: `password123`

## Структура монорепозитория

```
packages/
├── client/   # React PWA
├── server/   # Express API + Prisma
└── shared/   # Общие типы TypeScript
docs/plantuml/  # UML-диаграммы (курсовой проект)
```

## Docker

Развёртывание через Docker Compose описано в [DEPLOY.md](./DEPLOY.md). Пример переменных для production: `.env.production.example`.

```bash
docker compose up -d --build
```

## Безопасность

- JWT: access-токен в памяти клиента, refresh в httpOnly-куки;
- bcrypt для паролей;
- валидация запросов (Zod), helmet, CORS, rate limiting, CSRF для API;
- санитизация ответов ИИ перед отображением;
- секреты GigaChat и БД только на сервере.

## Лицензия

Учебный проект. Использование кода — по согласованию с автором.
