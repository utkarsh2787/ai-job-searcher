import { Router } from 'express';
import { handleJobSearch, handleGetJobById } from '../controllers/jobs.controller';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { searchRateLimiter } from '../middleware/rate-limit.middleware';
import { validateQuery, jobSearchSchema } from '../middleware/validation.middleware';
import { config } from '../config';

const router = Router();

// GET /api/jobs/search?q=typescript&remote=true&page=1
router.get(
  '/search',
  searchRateLimiter,
  validateQuery(jobSearchSchema),
  cacheMiddleware(config.CACHE_TTL_SEARCH),
  handleJobSearch
);

// GET /api/jobs/:id
router.get(
  '/:id',
  cacheMiddleware(config.CACHE_TTL_JOB_DETAIL),
  handleGetJobById
);

export default router;
