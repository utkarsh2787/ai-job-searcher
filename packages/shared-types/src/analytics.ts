export interface SkillTrend {
  skill: string;
  count: number;
  trend?: string;
}

export interface CompanyMetric {
  name: string;
  normalized: string;
  postings: number;
  trend?: string;
}

export interface SalaryBucket {
  level: string;
  p25: number;
  median: number;
  p75: number;
  count: number;
}

export interface LocationDemand {
  city?: string;
  state?: string;
  country: string;
  jobCount: number;
}

export type SnapshotType =
  | 'top_skills_7d'
  | 'top_skills_30d'
  | 'top_companies_7d'
  | 'top_companies_30d'
  | 'salary_by_seniority'
  | 'job_growth_90d'
  | 'top_locations_30d';

export interface AnalyticsSnapshot {
  snapshotType: SnapshotType;
  generatedAt: string;
  data: unknown;
}
