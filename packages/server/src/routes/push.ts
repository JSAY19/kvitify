import { Router } from 'express';
import type { RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/db.js';
import { getVapidKeys } from '../config/vapid.js';
import { pushSubscribeSchema } from '../validators/push.js';
import webPush from 'web-push';

export const pushRouter = Router();

const vapid = getVapidKeys();
if (vapid) {
  webPush.setVapidDetails('mailto:admin@kvitifai.app', vapid.publicKey, vapid.privateKey);
}

const getPublicKey: RequestHandler = (_req, res) => {
  res.json({ publicKey: vapid?.publicKey ?? '' });
};

const subscribe: RequestHandler = async (req, res, next) => {
  try {
    const { subscription } = req.body as { subscription: webPush.PushSubscription };

    await prisma.user.update({
      where: { id: req.userId! },
      data: { pushSubscription: JSON.stringify(subscription) },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

const testPush: RequestHandler = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user?.pushSubscription) {
      res.status(400).json({ error: 'Подписка не найдена. Включите уведомления в профиле.' });
      return;
    }

    const subscription = JSON.parse(user.pushSubscription) as webPush.PushSubscription;
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'КвитиФай',
        body: 'Это тестовое push-уведомление. Всё работает!',
        icon: '/icons/icon-192.png',
      }),
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

pushRouter.get('/vapid-key', getPublicKey);
pushRouter.post('/subscribe', requireAuth, validate(pushSubscribeSchema), subscribe);
pushRouter.post('/test', requireAuth, testPush);
