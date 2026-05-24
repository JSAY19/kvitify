import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createCsrfGuard } from './middleware/csrf.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';
import { progressRouter } from './routes/progress.js';
import { aiRouter } from './routes/ai.js';
import { pushRouter } from './routes/push.js';
import { achievementsRouter } from './routes/achievements.js';
import { journalRouter } from './routes/journal.js';
import { communityRouter } from './routes/community.js';
import { tipsRouter } from './routes/tips.js';
import { healthRouter } from './routes/health.js';

const app = express();
const isDev = env.NODE_ENV !== 'production';
app.set('trust proxy', 'loopback');

app.use(
  helmet({
    contentSecurityPolicy: isDev
      ? false
      : {
          useDefaults: true,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
          },
        },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
const extraOrigins = (env.CLIENT_URLS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOriginsList = isDev
  ? ['http://localhost:5173', 'http://127.0.0.1:5173', env.CLIENT_URL, ...extraOrigins]
  : [env.CLIENT_URL, ...extraOrigins];
app.use(cors({ origin: corsOriginsList, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.use('/api', createCsrfGuard(corsOriginsList));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 50 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток. Подождите 15 минут.' },
});
app.use('/api/auth', authLimiter);

if (!isDev) {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/auth'),
  });
  app.use('/api', apiLimiter);
}

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai', aiRouter);
app.use('/api/push', pushRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/community', communityRouter);
app.use('/api/tips', tipsRouter);
app.use('/api/health', healthRouter);

app.use(errorHandler);

export { app };
