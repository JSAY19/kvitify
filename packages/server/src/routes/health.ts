import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDailyHealth } from '../controllers/health.js';

export const healthRouter = Router();

healthRouter.use(requireAuth);
healthRouter.get('/daily', getDailyHealth);
