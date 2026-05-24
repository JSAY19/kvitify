import { Router } from 'express';
import {
  chat, cravingSupport, motivation, recommendations,
  listConversations, createConversation, getConversation,
  renameConversation, deleteConversation,
} from '../controllers/ai.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { chatSchema, renameConversationSchema } from '../validators/ai.js';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const aiRouter = Router();

aiRouter.use(requireAuth);

if (env.NODE_ENV === 'production') {
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });
  aiRouter.use(aiLimiter);
}

aiRouter.get('/conversations', listConversations);
aiRouter.post('/conversations', createConversation);
aiRouter.get('/conversations/:id', getConversation);
aiRouter.patch('/conversations/:id', validate(renameConversationSchema), renameConversation);
aiRouter.delete('/conversations/:id', deleteConversation);

aiRouter.post('/chat', validate(chatSchema), chat);
aiRouter.post('/craving-support', cravingSupport);
aiRouter.get('/motivation', motivation);
aiRouter.get('/recommendations', recommendations);
