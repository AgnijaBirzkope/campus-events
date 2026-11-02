import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.mjs';
import { sequelize, Event, Registration } from './models/index.mjs';
import { seedDemoData } from './demo/seedDemoData.mjs';
import { eventsRouter } from './routes/events.mjs';
import { statsController } from './controllers/statsController.mjs';
import { errorHandler, notFoundHandler } from './middleware/errors.mjs';
import { requestLogger } from './middleware/requestLogger.mjs';

export const app = express();
app.use(express.json());
app.use(requestLogger);
app.get('/api/health', async (_req, res) => {
  await sequelize.authenticate();
  res.json({ status: 'ok' });
});
app.use('/api/events', eventsRouter);
app.get('/api/stats', statsController.list);

if (env.nodeEnv === 'production') {
  const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');
  app.use(express.static(webRoot));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(webRoot, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);

export { Event, Registration, seedDemoData, sequelize };
