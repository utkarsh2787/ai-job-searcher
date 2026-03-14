import { Router, Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import { config } from '../config';

const router = Router();

// GET /health — used by load balancers and Docker healthchecks
router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Check Elasticsearch
  try {
    const es = new Client({ node: config.ELASTICSEARCH_URL });
    const health = await es.cluster.health({ timeout: '3s' });
    checks['elasticsearch'] = health.status;
  } catch {
    checks['elasticsearch'] = 'unreachable';
  }

  const allHealthy = Object.values(checks).every(
    (s) => s === 'green' || s === 'yellow'
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
