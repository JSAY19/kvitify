import { app } from './app.js';
import { env } from './config/env.js';

const host = env.HOST || (env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

app.listen(env.PORT, host, () => {
  console.log(`Server running on http://${host}:${env.PORT} (${env.NODE_ENV})`);
});
