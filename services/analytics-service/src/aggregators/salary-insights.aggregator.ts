import { NormalizedJob } from '@job-platform/shared-types';
import { getDb } from '../db/client';

// Only records salary data when both min and max are present and non-estimated,
// or when min/max are present but estimated (still useful for trends).
// Skips jobs with no salary data entirely.
export async function recordSalaryData(job: NormalizedJob, jobRowId: string): Promise<void> {
  const { salary } = job;

  if (!salary.min || !salary.max) return;
  if (salary.period === 'unknown') return;

  const sql = getDb();

  await sql`
    INSERT INTO salary_data_points (
      job_id, title_normalized, seniority_level, category,
      location_country, is_remote, salary_min, salary_max
    )
    VALUES (
      ${jobRowId}::uuid,
      ${job.titleNormalized},
      ${job.seniorityLevel},
      ${job.category},
      ${job.location.country ?? null},
      ${job.location.isRemote},
      ${salary.min},
      ${salary.max}
    )
    ON CONFLICT DO NOTHING
  `;
}
