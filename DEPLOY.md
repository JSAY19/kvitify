# Деплой KvitiFai

Монорепо: `packages/server` (Express + Prisma) + `packages/client` (Vite + React) + `packages/shared` (общие типы).
Подготовлено для одношагового деплоя через **docker-compose**.

## TL;DR

```bash
cp .env.production.example .env
# заполнить секреты (JWT_*, GIGACHAT_CREDENTIALS, CLIENT_URL, POSTGRES_PASSWORD)
docker compose up -d --build
# открыть http://<host>:80
```

Сервер автоматически выполнит `prisma migrate deploy` при старте.

---

## Что задеплоится

| Сервис | Порт (внутри) | Порт (наружу) | Что |
| --- | --- | --- | --- |
| `client` | 80 | `${CLIENT_PORT:-80}` | nginx со статикой Vite + проксирование `/api` → server |
| `server` | 3001 | не публикуется | Express, миграции на старте, healthcheck `/healthz` |
| `db` | 5432 | не публикуется | postgres:16-alpine, volume `db-data` |

## Обязательные секреты

| Переменная | Описание |
| --- | --- |
| `POSTGRES_PASSWORD` | пароль БД |
| `JWT_SECRET` | ≥64 символов, `openssl rand -hex 48` |
| `JWT_REFRESH_SECRET` | ≥64 символов, отличный от `JWT_SECRET` |
| `GIGACHAT_CREDENTIALS` | base64 ключ от Sber GigaChat |
| `CLIENT_URL` | публичный HTTPS-URL фронта (для CORS/CSRF/CSP) |

Опционально:
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — push-уведомления (`npx web-push generate-vapid-keys`).
- `CLIENT_URLS` — список доп. доменов через запятую.
- `GIGACHAT_ALLOW_INSECURE=true` — НУЦ Минцифры сертификат не доверен Node по умолчанию; оставлять `true` пока не настроен CA bundle.

## HTTPS

Положи рядом reverse-proxy (caddy/traefik/nginx) с TLS-сертификатом и проксируй `https://example.com` → `client:80`. Cookie с JWT уже идут `httpOnly` + `sameSite=lax`/`strict` (см. `packages/server/src/controllers/auth.ts`).

## Полезные команды

```bash
# логи
docker compose logs -f server
docker compose logs -f client

# применить миграции вручную
docker compose exec server npx prisma migrate deploy --schema=packages/server/prisma/schema.prisma

# seed (демо-данные)
docker compose exec server node -e "require('child_process').spawnSync('npx',['tsx','packages/server/prisma/seed.ts'],{stdio:'inherit'})"

# health
curl http://localhost/healthz   # 200 ok
```

## Деплой без docker (PaaS: Render/Railway/Fly)

Один процесс с воркспейсами:

```bash
npm ci
npm run build
npm run start:prod   # = prisma migrate deploy && node packages/server/dist/index.js
```

Переменные окружения: см. `.env.production.example`. Фронт собирается отдельно (`npm run build -w packages/client`), деплоится как статика; в nginx/edge — проксирование `/api/*` на бэкенд.

## Чек-лист перед прод-запуском

- [ ] `JWT_SECRET` и `JWT_REFRESH_SECRET` сгенерированы новые, не из примера.
- [ ] `POSTGRES_PASSWORD` сильный.
- [ ] `CLIENT_URL` совпадает с реальным HTTPS-доменом (без слэша в конце).
- [ ] Проверен `GET /healthz` → 200.
- [ ] Проверен логин/регистрация (auth rate limiter активен в prod).
- [ ] Проверен AI-чат и `GET /api/health/daily` — если GigaChat не отвечает, исправь `GIGACHAT_CREDENTIALS`.
- [ ] Бэкапы `db-data` volume настроены.
