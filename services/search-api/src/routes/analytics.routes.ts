import { Router } from 'express';
import {
  handleGetSkills,
  handleGetCompanies,
  handleGetSalary,
  handleGetJobGrowth,
  handleGetLocations,
  handleGetStats,
} from '../controllers/analytics.controller';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { validateQuery, analyticsSkillsSchema, analyticsCompaniesSchema } from '../middleware/validation.middleware';
import { config } from '../config';

const router = Router();

// GET /api/analytics/skills?period=7d
router.get('/skills',    validateQuery(analyticsSkillsSchema),    cacheMiddleware(config.CACHE_TTL_ANALYTICS), handleGetSkills);

// GET /api/analytics/companies?period=30d
router.get('/companies', validateQuery(analyticsCompaniesSchema), cacheMiddleware(config.CACHE_TTL_ANALYTICS), handleGetCompanies);

// GET /api/analytics/salary
router.get('/salary',    cacheMiddleware(config.CACHE_TTL_ANALYTICS), handleGetSalary);

// GET /api/analytics/growth
router.get('/growth',    cacheMiddleware(config.CACHE_TTL_ANALYTICS), handleGetJobGrowth);

// GET /api/analytics/locations
router.get('/locations', cacheMiddleware(config.CACHE_TTL_ANALYTICS), handleGetLocations);

// GET /api/analytics/stats  — live platform numbers (header dashboard counters)
router.get('/stats',     cacheMiddleware(60), handleGetStats);

export default router;
