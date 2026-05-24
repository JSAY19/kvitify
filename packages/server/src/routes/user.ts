import { Router } from 'express';
import { getMe, onboarding, updateProfile } from '../controllers/user.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { onboardingSchema, updateProfileSchema } from '../validators/user.js';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', getMe);
userRouter.post('/onboarding', validate(onboardingSchema), onboarding);
userRouter.put('/profile', validate(updateProfileSchema), updateProfile);
