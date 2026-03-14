import { NormalizedJob } from '@job-platform/shared-types';
import { getDb } from '../db/client';

export async function recordLocationDemand(job: NormalizedJob): Promise<void> {
  const { location } = job;

  // Skip fully remote jobs with no country — not useful for location heatmap
  if (!location.country && !location.city) return;

  const sql = getDb();
  const today = new Date().toISOString().split('T')[0];
  const country = location.country ?? 'Unknown';
  const city = location.city ?? null;

  await sql`
    INSERT INTO location_daily_demand (city, country, date, job_count)
    VALUES (${city}, ${country}, ${today}::date, 1)
    ON CONFLICT (city, country, date)
    DO UPDATE SET job_count = location_daily_demand.job_count + 1
  `;
}
