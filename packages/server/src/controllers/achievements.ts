import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { ACHIEVEMENT_DEFS, checkAndUnlockAchievements } from '../services/achievements.js';
import { getDashboardData } from '../services/dashboard.js';

export const getAchievements: RequestHandler = async (req, res, next) => {
  try {
    const dash = await getDashboardData(req.userId!);
    const checkinsCount = await prisma.progressLog.count({
      where: { userId: req.userId!, type: 'DAILY_CHECKIN' },
    });
    await checkAndUnlockAchievements(req.userId!, {
      daysWithoutSmoking: dash.daysWithoutSmoking,
      moneySaved: dash.moneySaved,
      streak: dash.streak,
      checkinsCount,
    });

    const unlocked = await prisma.achievement.findMany({
      where: { userId: req.userId! },
      orderBy: { unlockedAt: 'desc' },
    });

    const unlockedMap = new Map(unlocked.map((a) => [a.type, a.unlockedAt.toISOString()]));

    const all = ACHIEVEMENT_DEFS.map((def) => ({
      type: def.type,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked: unlockedMap.has(def.type),
      unlockedAt: unlockedMap.get(def.type) ?? null,
    }));

    res.json(all);
  } catch (err) {
    next(err);
  }
};
