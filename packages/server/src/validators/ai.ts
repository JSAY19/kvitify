import { z } from 'zod';

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
  conversationId: z.string().uuid().optional(),
});

export const renameConversationSchema = z.object({
  title: z.string().min(1).max(80),
});
