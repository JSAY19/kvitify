import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { getDailyTip } from '../services/tips.js';

export const dailyTip: RequestHandler = async (req, res, next) => {
  try {
    const profile = await prisma.smokingProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile) {
      res.json(getDailyTip(0));
      return;
    }

    const daysWithoutSmoking = Math.floor(
      (Date.now() - profile.quitDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    res.json(getDailyTip(Math.max(0, daysWithoutSmoking)));
  } catch (err) {
    next(err);
  }
};
