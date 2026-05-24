import { Router } from 'express';
import { dashboard, getLogs, checkin, craving } from '../controllers/progress.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkinSchema, cravingSchema } from '../validators/progress.js';

export const progressRouter = Router();

progressRouter.use(requireAuth);
progressRouter.get('/dashboard', dashboard);
progressRouter.get('/logs', getLogs);
progressRouter.post('/checkin', validate(checkinSchema), checkin);
progressRouter.post('/craving', validate(cravingSchema), craving);
