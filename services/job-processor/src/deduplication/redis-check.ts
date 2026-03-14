import Redis from 'ioredis';
import { config } from '../config';

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(config.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    client.on('error', (err) => console.error('[redis] Error:', err.message));
    client.on('connect', () => console.log('[redis] Connected'));
  }
  return client;
}

const TTL_SECONDS = config.REDIS_DEDUP_TTL_DAYS * 24 * 60 * 60;
const KEY_PREFIX = 'dedup:';

export interface DeduplicationResult {
  isFirstSeen: boolean;
  existingJobId?: string;
}

// Returns whether this is the first time we've seen this fingerprint.
// If first seen: stores fingerprint → jobId in Redis with TTL.
// If seen before: returns the existing jobId so downstream can update vs insert.
export async function checkAndRegister(
  fingerprint: string,
  jobId: string
): Promise<DeduplicationResult> {
  const redis = getRedisClient();
  const key = `${KEY_PREFIX}${fingerprint}`;

  // SET key value EX ttl NX — only sets if not exists, atomic
  const result = await redis.set(key, jobId, 'EX', TTL_SECONDS, 'NX');

  if (result === 'OK') {
    // Key was set — this is the first time we've seen this job
    return { isFirstSeen: true };
  }

  // Key already existed — retrieve the stored jobId
  const existingJobId = await redis.get(key);

  // Refresh TTL so active job listings don't expire
  await redis.expire(key, TTL_SECONDS);

  return { isFirstSeen: false, existingJobId: existingJobId ?? undefined };
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    console.log('[redis] Disconnected');
  }
}
