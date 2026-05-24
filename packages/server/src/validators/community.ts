import { z } from 'zod';

export const REACTION_EMOJIS = ['like', 'love', 'celebrate', 'strong', 'pray'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const createPostSchema = z.object({
  content: z.string().min(1, 'Сообщение не может быть пустым').max(1000, 'Не более 1000 символов'),
});

export const reactionSchema = z.object({
  emoji: z.enum(REACTION_EMOJIS),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Комментарий не может быть пустым').max(500, 'Не более 500 символов'),
});
