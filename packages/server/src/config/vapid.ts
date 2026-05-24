import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import webPush from 'web-push';
import { env } from './env.js';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const cachePath = path.resolve(here, '../../.vapid-keys.json');

interface VapidKeys { publicKey: string; privateKey: string }

function loadCachedKeys(): VapidKeys | null {
  try {
    if (!fs.existsSync(cachePath)) return null;
    const raw = fs.readFileSync(cachePath, 'utf8');
    const parsed = JSON.parse(raw) as VapidKeys;
    if (parsed.publicKey && parsed.privateKey) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveCachedKeys(keys: VapidKeys) {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(keys, null, 2), 'utf8');
  } catch (err) {
    console.warn('[vapid] failed to cache keys:', err);
  }
}

export function getVapidKeys(): VapidKeys | null {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    return { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY };
  }

  const cached = loadCachedKeys();
  if (cached) {
    console.log('[vapid] using cached keys from .vapid-keys.json');
    return cached;
  }

  if (env.NODE_ENV === 'production') return null;

  const generated = webPush.generateVAPIDKeys();
  saveCachedKeys(generated);
  console.log('[vapid] generated new keys and cached to .vapid-keys.json');
  return generated;
}
