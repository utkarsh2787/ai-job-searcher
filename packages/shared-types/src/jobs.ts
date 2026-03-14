export type JobSource = 'remotive' | 'adzuna' | 'themuse';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'unknown';
export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown';
export type RemoteType = 'fully_remote' | 'hybrid' | 'remote_friendly';

export interface NormalizedJob {
  jobId: string;
  sourceId: string;
  sourceUrl: string;
  title: string;
  titleNormalized: string;
  description: string;
  descriptionHtml?: string;
  company: {
    name: string;
    nameNormalized: string;
    logoUrl?: string;
  };
  location: {
    raw: string;
    city?: string;
    state?: string;
    country?: string;
    isRemote: boolean;
    remoteType?: RemoteType;
  };
  jobType: JobType;
  seniorityLevel: SeniorityLevel;
  category: string;
  skills: string[];
  skillsRaw: string[];
  salary: {
    raw?: string;
    min?: number;
    max?: number;
    currency: string;
    period: 'annual' | 'hourly' | 'unknown';
    isEstimated: boolean;
  };
  postedAt: string;
  collectedAt: string;
  updatedAt: string;
  expiresAt?: string;
}
