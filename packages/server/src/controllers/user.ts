import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { OnboardingData } from '@kvitifai/shared';

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true },
    });
    if (!user) throw new AppError(404, 'Пользователь не найден');

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
};

export const onboarding: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body as OnboardingData;

    const existing = await prisma.smokingProfile.findUnique({ where: { userId: req.userId! } });
    if (existing) throw new AppError(409, 'Профиль курения уже создан');

    const profile = await prisma.smokingProfile.create({
      data: {
        userId: req.userId!,
        quitDate: new Date(data.quitDate),
        cigarettesPerDay: data.cigarettesPerDay,
        pricePerPack: data.pricePerPack,
        cigarettesPerPack: data.cigarettesPerPack,
        smokingYears: data.smokingYears,
        motivation: data.motivation,
      },
    });

    res.status(201).json({
      id: profile.id,
      quitDate: profile.quitDate.toISOString(),
      cigarettesPerDay: profile.cigarettesPerDay,
      pricePerPack: profile.pricePerPack,
      cigarettesPerPack: profile.cigarettesPerPack,
      smokingYears: profile.smokingYears,
      motivation: profile.motivation,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: req.body as { name?: string; email?: string },
    });

    res.json({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    next(err);
  }
};
