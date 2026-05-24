import { z } from 'zod';

export const checkinSchema = z
  .object({
    mood: z.number().int().min(1).max(5),
    cravingLevel: z.number().int().min(0).max(10),
    cigarettesSmoked: z.number().int().min(0).max(100).default(0),
    notes: z.string().max(500).optional(),
    usedTobacco: z.boolean().default(false),
    substanceType: z.enum(['CIGARETTE', 'VAPE']).optional(),
  })
  .refine((d) => !d.usedTobacco || !!d.substanceType, {
    message: 'substanceType обязателен при usedTobacco=true',
    path: ['substanceType'],
  });

export const cravingSchema = z.object({
  cravingLevel: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
});
