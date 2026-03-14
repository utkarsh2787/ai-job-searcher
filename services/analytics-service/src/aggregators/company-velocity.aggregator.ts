import { NormalizedJob } from '@job-platform/shared-types';
import { getDb } from '../db/client';

export async function recordCompanyPosting(job: NormalizedJob): Promise<void> {
  const sql = getDb();
  const today = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO company_daily_postings (company_normalized, company_display, date, posting_count)
    VALUES (
      ${job.company.nameNormalized},
      ${job.company.name},
      ${today}::date,
      1
    )
    ON CONFLICT (company_normalized, date)
    DO UPDATE SET
      posting_count = company_daily_postings.posting_count + 1,
      -- Keep the best-known display name (longest, most complete)
      company_display = CASE
        WHEN length(EXCLUDED.company_display) > length(company_daily_postings.company_display)
        THEN EXCLUDED.company_display
        ELSE company_daily_postings.company_display
      END
  `;
}
