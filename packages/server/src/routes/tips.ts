import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { dailyTip } from '../controllers/tips.js';

export const tipsRouter = Router();
tipsRouter.use(requireAuth);
tipsRouter.get('/daily', dailyTip);
