import { prisma } from '../config/db.js';
import { awardPoints } from './points.js';

interface AchievementDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: { daysWithoutSmoking: number; moneySaved: number; streak: number; checkinsCount: number }) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { type: 'days_1', title: 'Первый день', description: '1 день без сигарет', icon: 'Sunrise', check: (c) => c.daysWithoutSmoking >= 1 },
  { type: 'days_3', title: 'Три дня силы', description: '3 дня без сигарет', icon: 'Flame', check: (c) => c.daysWithoutSmoking >= 3 },
  { type: 'days_7', title: 'Неделя свободы', description: '7 дней без сигарет', icon: 'Calendar', check: (c) => c.daysWithoutSmoking >= 7 },
  { type: 'days_14', title: 'Две недели', description: '14 дней без сигарет', icon: 'Shield', check: (c) => c.daysWithoutSmoking >= 14 },
  { type: 'days_30', title: 'Месяц!', description: '30 дней без сигарет', icon: 'Trophy', check: (c) => c.daysWithoutSmoking >= 30 },
  { type: 'days_90', title: 'Квартал', description: '90 дней без сигарет', icon: 'Crown', check: (c) => c.daysWithoutSmoking >= 90 },
  { type: 'days_180', title: 'Полгода', description: '180 дней без сигарет', icon: 'Star', check: (c) => c.daysWithoutSmoking >= 180 },
  { type: 'days_365', title: 'Год свободы!', description: '365 дней без сигарет', icon: 'Award', check: (c) => c.daysWithoutSmoking >= 365 },
  { type: 'money_500', title: 'Первые 500₽', description: 'Сэкономлено 500₽', icon: 'Wallet', check: (c) => c.moneySaved >= 500 },
  { type: 'money_1000', title: 'Тысяча!', description: 'Сэкономлено 1000₽', icon: 'Banknote', check: (c) => c.moneySaved >= 1000 },
  { type: 'money_5000', title: 'Пять тысяч', description: 'Сэкономлено 5000₽', icon: 'PiggyBank', check: (c) => c.moneySaved >= 5000 },
  { type: 'streak_3', title: 'Серия 3', description: '3 чекина подряд', icon: 'Zap', check: (c) => c.streak >= 3 },
  { type: 'streak_7', title: 'Серия 7', description: '7 чекинов подряд', icon: 'Target', check: (c) => c.streak >= 7 },
  { type: 'streak_30', title: 'Серия 30', description: '30 чекинов подряд', icon: 'Medal', check: (c) => c.streak >= 30 },
  { type: 'checkins_10', title: 'Десять отметок', description: '10 ежедневных чекинов', icon: 'ClipboardCheck', check: (c) => c.checkinsCount >= 10 },
];

export async function checkAndUnlockAchievements(
  userId: string,
  ctx: { daysWithoutSmoking: number; moneySaved: number; streak: number; checkinsCount: number },
): Promise<string[]> {
  const existing = await prisma.achievement.findMany({ where: { userId }, select: { type: true } });
  const existingTypes = new Set(existing.map((a) => a.type));

  const newlyUnlocked: string[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (existingTypes.has(def.type)) continue;
    if (def.check(ctx)) {
      await prisma.achievement.create({ data: { userId, type: def.type } });
      await awardPoints(userId, 50, 'achievement');
      newlyUnlocked.push(def.type);
    }
  }

  return newlyUnlocked;
}
