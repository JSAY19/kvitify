import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@kvitifai.app' },
    update: {},
    create: {
      email: 'demo@kvitifai.app',
      name: 'Демо',
      passwordHash,
      profile: {
        create: {
          quitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          cigarettesPerDay: 20,
          pricePerPack: 200,
          cigarettesPerPack: 20,
          smokingYears: 5,
          motivation: 'Здоровье и семья',
        },
      },
    },
  });

  // Add some demo progress logs
  const days = [7, 6, 5, 4, 3, 2, 1, 0];
  for (const d of days) {
    await prisma.progressLog.create({
      data: {
        userId: user.id,
        date: new Date(Date.now() - d * 24 * 60 * 60 * 1000),
        type: 'DAILY_CHECKIN',
        mood: Math.floor(Math.random() * 3) + 3,
        cravingLevel: Math.max(1, 8 - d),
        cigarettesSmoked: 0,
        notes: d === 0 ? 'Сегодня хороший день!' : undefined,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
