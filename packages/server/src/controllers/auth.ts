import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RegisterInput, LoginInput } from '@kvitifai/shared';

const isProd = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function serializeUser(user: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  profile?: {
    id: string;
    quitDate: Date;
    cigarettesPerDay: number;
    pricePerPack: number;
    cigarettesPerPack: number;
    smokingYears: number | null;
    motivation: string | null;
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile
      ? {
          id: user.profile.id,
          quitDate: user.profile.quitDate.toISOString(),
          cigarettesPerDay: user.profile.cigarettesPerDay,
          pricePerPack: user.profile.pricePerPack,
          cigarettesPerPack: user.profile.cigarettesPerPack,
          smokingYears: user.profile.smokingYears,
          motivation: user.profile.motivation,
        }
      : null,
  };
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body as RegisterInput;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'Пользователь с таким email уже существует');

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      include: { profile: true },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({ accessToken, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) throw new AppError(401, 'Неверный email или пароль');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Неверный email или пароль');

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw new AppError(401, 'Refresh token отсутствует');

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });
    if (!user) throw new AppError(401, 'Пользователь не найден');

    const accessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ ok: true });
};
