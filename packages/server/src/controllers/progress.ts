import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { getDashboardData } from '../services/dashboard.js';
import { checkAndUnlockAchievements } from '../services/achievements.js';
import { awardPoints } from '../services/points.js';
import type { CheckinInput, CravingInput } from '@kvitifai/shared';

export const dashboard: RequestHandler = async (req, res, next) => {
  try {
    const data = await getDashboardData(req.userId!);
    const checkinsCount = await prisma.progressLog.count({
      where: { userId: req.userId!, type: 'DAILY_CHECKIN' },
    });
    await checkAndUnlockAchievements(req.userId!, {
      daysWithoutSmoking: data.daysWithoutSmoking,
      moneySaved: data.moneySaved,
      streak: data.streak,
      checkinsCount,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getLogs: RequestHandler = async (req, res, next) => {
  try {
    const { from, to, page = '1', limit = '20' } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { userId: req.userId! };
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));

    const [logs, total] = await Promise.all([
      prisma.progressLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.progressLog.count({ where }),
    ]);

    res.json({
      logs: logs.map((l) => ({
        id: l.id,
        date: l.date.toISOString(),
        type: l.type,
        cravingLevel: l.cravingLevel,
        mood: l.mood,
        notes: l.notes,
        cigarettesSmoked: l.cigarettesSmoked,
        usedTobacco: l.usedTobacco,
        substanceType: l.substanceType,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
};

export const checkin: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body as CheckinInput;

    const usedTobacco = !!data.usedTobacco;
    const substanceType = usedTobacco ? data.substanceType ?? null : null;
    const cigarettesSmoked = usedTobacco ? Math.max(0, data.cigarettesSmoked || 0) : 0;
    const logType = usedTobacco ? 'RELAPSE' : 'DAILY_CHECKIN';

    const log = await prisma.progressLog.create({
      data: {
        userId: req.userId!,
        type: logType,
        mood: data.mood,
        cravingLevel: data.cravingLevel,
        cigarettesSmoked,
        notes: data.notes,
        usedTobacco,
        substanceType,
      },
    });

    let pointsAwarded = 0;
    let pointsTotal = 0;

    if (!usedTobacco) {
      const startOfDay = new Date(log.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const cleanToday = await prisma.progressLog.count({
        where: {
          userId: req.userId!,
          type: 'DAILY_CHECKIN',
          usedTobacco: false,
          date: { gte: startOfDay, lt: endOfDay },
        },
      });

      if (cleanToday === 1) {
        pointsTotal = await awardPoints(req.userId!, 10, 'clean_day');
        pointsAwarded = 10;
      } else {
        pointsTotal = await awardPoints(req.userId!, 1, 'checkin');
        pointsAwarded = 1;
      }
    } else {
      pointsTotal = await awardPoints(req.userId!, 1, 'checkin');
      pointsAwarded = 1;
    }

    const dashboard = await getDashboardData(req.userId!);
    const checkinsCount = await prisma.progressLog.count({
      where: { userId: req.userId!, type: 'DAILY_CHECKIN' },
    });
    const newAchievements = await checkAndUnlockAchievements(req.userId!, {
      daysWithoutSmoking: dashboard.daysWithoutSmoking,
      moneySaved: dashboard.moneySaved,
      streak: dashboard.streak,
      checkinsCount,
    });

    res.status(201).json({
      id: log.id,
      date: log.date.toISOString(),
      type: log.type,
      cravingLevel: log.cravingLevel,
      mood: log.mood,
      notes: log.notes,
      cigarettesSmoked: log.cigarettesSmoked,
      usedTobacco: log.usedTobacco,
      substanceType: log.substanceType,
      newAchievements,
      pointsAwarded,
      pointsTotal,
    });
  } catch (err) {
    next(err);
  }
};

export const craving: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body as CravingInput;

    const log = await prisma.progressLog.create({
      data: {
        userId: req.userId!,
        type: 'CRAVING',
        cravingLevel: data.cravingLevel,
        notes: data.notes,
      },
    });

    res.status(201).json({
      id: log.id,
      date: log.date.toISOString(),
      type: log.type,
      cravingLevel: log.cravingLevel,
      mood: log.mood,
      notes: log.notes,
      cigarettesSmoked: log.cigarettesSmoked,
    });
  } catch (err) {
    next(err);
  }
};
