import { z } from 'zod';

export const onboardingSchema = z.object({
  quitDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Некорректная дата отказа'),
  cigarettesPerDay: z.number().int().min(1).max(100),
  pricePerPack: z.number().min(0),
  cigarettesPerPack: z.number().int().min(1).max(50).default(20),
  smokingYears: z.number().int().min(0).optional(),
  motivation: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});
