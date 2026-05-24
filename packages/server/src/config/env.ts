import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GIGACHAT_CREDENTIALS: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('127.0.0.1'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_URLS: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  GIGACHAT_ALLOW_INSECURE: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (parsed.success && parsed.data.NODE_ENV !== 'production' && !parsed.data.GIGACHAT_ALLOW_INSECURE) {
  parsed.data.GIGACHAT_ALLOW_INSECURE = true;
  console.warn('[env] GIGACHAT_ALLOW_INSECURE force-enabled for development (НУЦ Минцифры сертификат)');
}

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
