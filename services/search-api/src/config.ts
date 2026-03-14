import { z } from 'zod';
import { parseEnv } from '@job-platform/shared-config';

const schema = z.object({
  PORT: z.coerce.number().default(3001),

  ELASTICSEARCH_URL:        z.string().default('http://localhost:9200'),
  ELASTICSEARCH_INDEX_JOBS: z.string().default('jobs'),

  POSTGRES_URL: z.string().min(1),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  CACHE_TTL_SEARCH:      z.coerce.number().default(30),
  CACHE_TTL_ANALYTICS:   z.coerce.number().default(300),
  CACHE_TTL_JOB_DETAIL:  z.coerce.number().default(120),

  RATE_LIMIT_WINDOW_MS:     z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS:  z.coerce.number().default(100),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export const config = parseEnv(schema);
export type Config = typeof config;
