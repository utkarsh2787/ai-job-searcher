import { NormalizedJob } from '@job-platform/shared-types';
import { getDb } from '../db/client';

// Increments skill counts for today.
// Uses INSERT ... ON CONFLICT to atomically upsert — safe for concurrent writes.
export async function recordSkillTrends(job: NormalizedJob): Promise<void> {
  if (job.skills.length === 0) return;

  const sql = getDb();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Batch all skills in one query using unnest
  await sql`
    INSERT INTO skill_daily_counts (skill, date, count)
    SELECT skill, ${today}::date, 1
    FROM unnest(${job.skills}::text[]) AS skill
    ON CONFLICT (skill, date)
    DO UPDATE SET count = skill_daily_counts.count + 1
  `;
}
