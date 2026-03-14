// ── Job types ─────────────────────────────────────────────────────────────────

export interface JobSummary {
  jobId:          string;
  title:          string;
  description?:   string;
  company:        { name: string; logoUrl?: string };
  location:       { raw: string; city?: string; country?: string; isRemote: boolean };
  jobType:        string;
  seniorityLevel: string;
  category:       string;
  skills:         string[];
  salary:         { min?: number; max?: number; currency: string; isEstimated: boolean };
  source:         string;
  sourceUrl:      string;
  postedAt:       string;
}

export interface SearchFacets {
  skills:    Bucket[];
  companies: Bucket[];
  locations: Bucket[];
  jobTypes:  Bucket[];
  seniority: Bucket[];
}

export interface Bucket {
  key:   string;
  count: number;
}

export interface JobSearchResponse {
  success:  boolean;
  total:    number;
  page:     number;
  pageSize: number;
  pages:    number;
  jobs:     JobSummary[];
  facets:   SearchFacets;
}

// ── Analytics types ───────────────────────────────────────────────────────────

export interface SkillTrend {
  skill: string;
  count: number;
  trend: string;
}

export interface SkillsData {
  generatedAt: string;
  period:      string;
  skills:      SkillTrend[];
}

export interface CompanyMetric {
  name:       string;
  normalized: string;
  postings:   number;
  trend:      string;
}

export interface CompaniesData {
  generatedAt: string;
  period:      string;
  companies:   CompanyMetric[];
}

export interface SalaryBucket {
  level:  string;
  p25:    number;
  median: number;
  p75:    number;
  count:  number;
}

export interface SalaryData {
  generatedAt: string;
  data:        SalaryBucket[];
}

export interface GrowthPoint {
  date:  string;
  count: number;
}

export interface JobGrowthData {
  generatedAt: string;
  series:      GrowthPoint[];
}

export interface LocationPoint {
  city:     string;
  country:  string;
  jobCount: number;
}

export interface PlatformStats {
  totalJobs:      number;
  totalCompanies: number;
  remoteJobs:     number;
  jobsLast7Days:  number;
}

// ── Search params ─────────────────────────────────────────────────────────────

export interface SearchParams {
  q?:           string;
  page?:        number;
  pageSize?:    number;
  remote?:      boolean;
  jobType?:     string;
  seniority?:   string;
  skills?:      string;
  company?:     string;
  location?:    string;
  salaryMin?:   number;
  salaryMax?:   number;
  sortBy?:      'relevance' | 'date' | 'salary';
  postedWithin?: number;
}
