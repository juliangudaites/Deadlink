import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import stripeWebhookRouter from './routes/stripeWebhook.js';
import healthRouter from './routes/health.js';
import linksRouter from './routes/links.js';
import tiersRouter from './routes/tiers.js';
import reportsRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/security.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.trim() ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Pin', 'X-Admin-Token', 'X-Deadlink-Code', 'X-Deadlink-Device'],
}));
app.use(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookRouter
);
app.use(express.json({ limit: '6mb' }));
app.use('/api', globalLimiter);

app.use('/api/health', healthRouter);
app.use('/api/links', linksRouter);
app.use('/api/tiers', tiersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
const clientBuilt = existsSync(clientDist);
if (clientBuilt) {
  app.use(express.static(clientDist, { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.status(503).json({
      status: 'error',
      service: 'DEADLINK',
      error: 'Frontend not built — run npm run build --prefix client during deploy',
      clientDist,
    });
  });
}

app.use(errorHandler);

export default app;