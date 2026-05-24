import type { RequestHandler } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const REQUESTED_WITH = 'kvitifai';

export const createCsrfGuard = (allowedOrigins: string[]): RequestHandler => {
  const allowed = new Set(allowedOrigins.filter(Boolean));

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const origin = req.headers.origin as string | undefined;
    const referer = req.headers.referer as string | undefined;
    const xrw = req.headers['x-requested-with'];

    let originHost: string | null = null;
    try {
      if (origin) originHost = new URL(origin).origin;
      else if (referer) originHost = new URL(referer).origin;
    } catch {
      originHost = null;
    }

    if (!originHost || !allowed.has(originHost)) {
      res.status(403).json({ error: 'Запрос отклонён (CSRF)' });
      return;
    }

    if (xrw !== REQUESTED_WITH) {
      res.status(403).json({ error: 'Запрос отклонён (CSRF token missing)' });
      return;
    }

    next();
  };
};
