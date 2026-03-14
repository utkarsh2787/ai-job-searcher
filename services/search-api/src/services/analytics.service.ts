import postgres from 'postgres';
import { config } from '../config';

let sql: ReturnType<typeof postgres> | null = null;

function getDb(): ReturnType<typeof postgres> {
  if (!sql) {
    sql = postgres(config.POSTGRES_URL, {
      max: 5,
      idle_timeout: 30,
      onnotice: () => {},
    });
  }
  return sql;
}

// ── Snapshot reads (single row fetches — sub-ms) ──────────────────────────────

// Snapshots may have been stored as JSON strings (legacy) or JSONB objects.
// This helper normalises both.
function parseSnapshot(raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

export async function getSkillsSnapshot(period: '7d' | '30d'): Promise<unknown> {
  const db = getDb();
  const snapshotType = period === '7d' ? 'top_skills_7d' : 'top_skills_30d';
  const rows = await db`SELECT data FROM analytics_snapshots WHERE snapshot_type = ${snapshotType}`;
  return parseSnapshot(rows[0]?.data) ?? null;
}

export async function getCompaniesSnapshot(period: '7d' | '30d'): Promise<unknown> {
  const db = getDb();
  const snapshotType = period === '7d' ? 'top_companies_7d' : 'top_companies_30d';
  const rows = await db`SELECT data FROM analytics_snapshots WHERE snapshot_type = ${snapshotType}`;
  return parseSnapshot(rows[0]?.data) ?? null;
}

export async function getSalarySnapshot(): Promise<unknown> {
  const db = getDb();
  const rows = await db`SELECT data FROM analytics_snapshots WHERE snapshot_type = 'salary_by_seniority'`;
  return parseSnapshot(rows[0]?.data) ?? null;
}

export async function getJobGrowthSnapshot(): Promise<unknown> {
  const db = getDb();
  const rows = await db`SELECT data FROM analytics_snapshots WHERE snapshot_type = 'job_growth_90d'`;
  return parseSnapshot(rows[0]?.data) ?? null;
}

export async function getLocationsSnapshot(): Promise<unknown> {
  const db = getDb();
  const rows = await db`SELECT data FROM analytics_snapshots WHERE snapshot_type = 'top_locations_30d'`;
  return parseSnapshot(rows[0]?.data) ?? null;
}

// ── Live stats (fast indexed queries — used for dashboard header numbers) ─────

export interface PlatformStats {
  totalJobs:      number;
  totalCompanies: number;
  remoteJobs:     number;
  jobsLast7Days:  number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = getDb();
  const rows = await db<[{
    total_jobs:       number;
    total_companies:  number;
    remote_jobs:      number;
    jobs_last_7_days: number;
  }]>`
    SELECT
      COUNT(*)                                                       AS total_jobs,
      COUNT(DISTINCT company_normalized)                             AS total_companies,
      COUNT(*) FILTER (WHERE is_remote = TRUE)                      AS remote_jobs,
      COUNT(*) FILTER (WHERE posted_at >= NOW() - INTERVAL '7 days') AS jobs_last_7_days
    FROM jobs
    WHERE is_active = TRUE
  `;

  const row = rows[0];
  return {
    totalJobs:      Number(row.total_jobs),
    totalCompanies: Number(row.total_companies),
    remoteJobs:     Number(row.remote_jobs),
    jobsLast7Days:  Number(row.jobs_last_7_days),
  };
}
