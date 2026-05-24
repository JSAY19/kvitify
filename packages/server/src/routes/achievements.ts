import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAchievements } from '../controllers/achievements.js';

export const achievementsRouter = Router();
achievementsRouter.use(requireAuth);
achievementsRouter.get('/', getAchievements);
