import rateLimit from 'express-rate-limit';
import { config } from '../config';

// Standard limiter — applied to all API routes
export const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max:      config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
  },
  // Use IP + path as the key so search and analytics have independent counters
  keyGenerator: (req) => `${req.ip}:${req.path.split('/')[2] ?? 'root'}`,
});

// Stricter limiter for search — prevents crawling/scraping
export const searchRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Search rate limit exceeded. Max 30 requests per minute.',
  },
});
