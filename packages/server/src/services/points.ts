import { prisma } from '../config/db.js';

export type PointsReason =
  | 'checkin'
  | 'clean_day'
  | 'achievement'
  | 'craving_survived';

export async function awardPoints(
  userId: string,
  delta: number,
  reason: PointsReason,
): Promise<number> {
  if (delta === 0) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    return u?.points ?? 0;
  }

  const [, updated] = await prisma.$transaction([
    prisma.pointsLedger.create({ data: { userId, delta, reason } }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: delta } },
      select: { points: true },
    }),
  ]);

  return updated.points;
}
