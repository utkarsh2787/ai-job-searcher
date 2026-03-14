import express from 'express';
import cors from 'cors';
import { apiRateLimiter } from './middleware/rate-limit.middleware';
import jobsRouter     from './routes/jobs.routes';
import analyticsRouter from './routes/analytics.routes';
import healthRouter   from './routes/health.routes';
import { config } from './config';

export function createApp(): express.Application {
  const app = express();

  // ── Global middleware ───────────────────────────────────────────────────────
  app.use(cors({
    origin:      config.CORS_ORIGIN,
    credentials: true,
    methods:     ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '1mb' }));

  // Trust proxy headers (needed for correct IP behind load balancer)
  app.set('trust proxy', 1);

  // Apply global rate limiter before routes
  app.use('/api', apiRateLimiter);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/jobs',       jobsRouter);
  app.use('/api/analytics',  analyticsRouter);
  app.use('/health',         healthRouter);

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  // ── Global error handler ───────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[app] Unhandled error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}
