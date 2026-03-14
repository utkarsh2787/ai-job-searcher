import { getDb } from '../db/client';

// Recomputes all pre-aggregated snapshots.
// Called on a schedule (every N minutes) — not per-event.
// The Search API reads these snapshots directly for sub-ms response times.
export async function rebuildAllSnapshots(): Promise<void> {
  console.log('[snapshots] Rebuilding all analytics snapshots...');

  await Promise.all([
    buildTopSkills('top_skills_7d', 7),
    buildTopSkills('top_skills_30d', 30),
    buildTopCompanies('top_companies_7d', 7),
    buildTopCompanies('top_companies_30d', 30),
    buildSalaryBySeniority(),
    buildJobGrowth(),
    buildTopLocations(),
  ]);

  console.log('[snapshots] All snapshots rebuilt');
}

async function buildTopSkills(snapshotType: string, days: number): Promise<void> {
  const sql = getDb();

  const rows = await sql<{ skill: string; total: number; prev_total: number }[]>`
    WITH current AS (
      SELECT skill, SUM(count) AS total
      FROM skill_daily_counts
      WHERE date >= CURRENT_DATE - ${days}::int
      GROUP BY skill
    ),
    previous AS (
      SELECT skill, SUM(count) AS total
      FROM skill_daily_counts
      WHERE date >= CURRENT_DATE - ${days * 2}::int
        AND date <  CURRENT_DATE - ${days}::int
      GROUP BY skill
    )
    SELECT
      c.skill,
      c.total,
      COALESCE(p.total, 0) AS prev_total
    FROM current c
    LEFT JOIN previous p USING (skill)
    ORDER BY c.total DESC
    LIMIT 30
  `;

  const data = {
    generatedAt: new Date().toISOString(),
    period:      `${days}d`,
    skills:      rows.map((r) => ({
      skill: r.skill,
      count: Number(r.total),
      trend: computeTrend(Number(r.total), Number(r.prev_total)),
    })),
  };

  await upsertSnapshot(snapshotType, data);
}

async function buildTopCompanies(snapshotType: string, days: number): Promise<void> {
  const sql = getDb();

  const rows = await sql<{ company_normalized: string; company_display: string; total: number; prev_total: number }[]>`
    WITH current AS (
      SELECT company_normalized, company_display, SUM(posting_count) AS total
      FROM company_daily_postings
      WHERE date >= CURRENT_DATE - ${days}::int
      GROUP BY company_normalized, company_display
    ),
    previous AS (
      SELECT company_normalized, SUM(posting_count) AS total
      FROM company_daily_postings
      WHERE date >= CURRENT_DATE - ${days * 2}::int
        AND date <  CURRENT_DATE - ${days}::int
      GROUP BY company_normalized
    )
    SELECT
      c.company_normalized,
      c.company_display,
      c.total,
      COALESCE(p.total, 0) AS prev_total
    FROM current c
    LEFT JOIN previous p USING (company_normalized)
    ORDER BY c.total DESC
    LIMIT 20
  `;

  const data = {
    generatedAt: new Date().toISOString(),
    period:      `${days}d`,
    companies:   rows.map((r) => ({
      name:       r.company_display,
      normalized: r.company_normalized,
      postings:   Number(r.total),
      trend:      computeTrend(Number(r.total), Number(r.prev_total)),
    })),
  };

  await upsertSnapshot(snapshotType, data);
}

async function buildSalaryBySeniority(): Promise<void> {
  const sql = getDb();

  const rows = await sql<{
    seniority_level: string;
    p25: number; median: number; p75: number; count: number;
  }[]>`
    SELECT
      seniority_level,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary_mid)::int AS p25,
      PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY salary_mid)::int AS median,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary_mid)::int AS p75,
      COUNT(*) AS count
    FROM salary_data_points
    WHERE recorded_at >= CURRENT_DATE - 60
      AND seniority_level != 'unknown'
    GROUP BY seniority_level
    ORDER BY median ASC
  `;

  const data = {
    generatedAt: new Date().toISOString(),
    data: rows.map((r) => ({
      level:  r.seniority_level,
      p25:    Number(r.p25),
      median: Number(r.median),
      p75:    Number(r.p75),
      count:  Number(r.count),
    })),
  };

  await upsertSnapshot('salary_by_seniority', data);
}

async function buildJobGrowth(): Promise<void> {
  const sql = getDb();

  const rows = await sql<{ date: string; job_count: number }[]>`
    SELECT
      posted_at::date AS date,
      COUNT(*) AS job_count
    FROM jobs
    WHERE posted_at >= NOW() - INTERVAL '90 days'
    GROUP BY posted_at::date
    ORDER BY date ASC
  `;

  const data = {
    generatedAt: new Date().toISOString(),
    series: rows.map((r) => ({
      date:  r.date,
      count: Number(r.job_count),
    })),
  };

  await upsertSnapshot('job_growth_90d', data);
}

async function buildTopLocations(): Promise<void> {
  const sql = getDb();

  const rows = await sql<{ city: string; country: string; total: number }[]>`
    SELECT
      COALESCE(city, 'Unknown') AS city,
      country,
      SUM(job_count) AS total
    FROM location_daily_demand
    WHERE date >= CURRENT_DATE - 30
      AND country IS NOT NULL
    GROUP BY city, country
    ORDER BY total DESC
    LIMIT 25
  `;

  const data = {
    generatedAt: new Date().toISOString(),
    locations: rows.map((r) => ({
      city:     r.city,
      country:  r.country,
      jobCount: Number(r.total),
    })),
  };

  await upsertSnapshot('top_locations_30d', data);
}

async function upsertSnapshot(snapshotType: string, data: unknown): Promise<void> {
  const sql = getDb();
  // Use sql.json() so postgres.js stores the value as a JSONB object,
  // not as a JSON string literal inside JSONB.
  await sql`
    INSERT INTO analytics_snapshots (snapshot_type, computed_at, data)
    VALUES (${snapshotType}, NOW(), ${sql.json(data as object)})
    ON CONFLICT (snapshot_type)
    DO UPDATE SET
      computed_at = EXCLUDED.computed_at,
      data        = EXCLUDED.data
  `;
}

function computeTrend(current: number, previous: number): string {
  if (previous === 0) return 'new';
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}
