import { prisma } from '../config/db.js';
import { HEALTH_IMPROVEMENTS } from '@kvitifai/shared';
import type { DashboardData, HealthImprovement } from '@kvitifai/shared';

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [profile, user] = await Promise.all([
    prisma.smokingProfile.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ]);

  if (!profile) {
    return {
      daysWithoutSmoking: 0,
      moneySaved: 0,
      cigarettesAvoided: 0,
      healthImprovements: [],
      recentLogs: [],
      streak: 0,
      points: user?.points ?? 0,
    };
  }

  const now = new Date();
  const quitDate = new Date(profile.quitDate);

  const lastRelapse = await prisma.progressLog.findFirst({
    where: {
      userId,
      OR: [
        { type: 'RELAPSE' },
        { usedTobacco: true },
        { cigarettesSmoked: { gt: 0 } },
      ],
    },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  const effectiveStart =
    lastRelapse && lastRelapse.date > quitDate ? lastRelapse.date : quitDate;

  const hoursSinceQuit = Math.max(0, (now.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60));
  const daysSinceQuit = Math.floor(hoursSinceQuit / 24);

  const pricePerCigarette = profile.pricePerPack / profile.cigarettesPerPack;
  const cigarettesAvoided = daysSinceQuit * profile.cigarettesPerDay;
  const moneySaved = Math.round(cigarettesAvoided * pricePerCigarette * 100) / 100;

  const healthImprovements: HealthImprovement[] = HEALTH_IMPROVEMENTS.map((hi) => {
    const progress = Math.min(100, Math.round((hoursSinceQuit / hi.timeRequired) * 100));
    return {
      title: hi.title,
      description: hi.description,
      timeRequired: hi.timeRequired,
      achieved: hoursSinceQuit >= hi.timeRequired,
      progress,
    };
  });

  const recentLogs = await prisma.progressLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
  });

  const checkins = await prisma.progressLog.findMany({
    where: { userId, type: 'DAILY_CHECKIN' },
    orderBy: { date: 'desc' },
    take: 90,
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const cleanCheckin = checkins.some(
      (c) => c.date >= day && c.date < dayEnd && !c.usedTobacco && c.cigarettesSmoked === 0,
    );

    if (cleanCheckin) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    daysWithoutSmoking: daysSinceQuit,
    moneySaved,
    cigarettesAvoided,
    healthImprovements,
    recentLogs: recentLogs.map((l) => ({
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
    streak,
    points: user?.points ?? 0,
  };
}
