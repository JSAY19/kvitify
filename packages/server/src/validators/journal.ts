import { z } from 'zod';

export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Заголовок не может быть пустым').max(120, 'Не более 120 символов'),
  content: z.string().min(1, 'Запись не может быть пустой').max(5000, 'Не более 5000 символов'),
  mood: z.number().int().min(1).max(5).optional(),
});
