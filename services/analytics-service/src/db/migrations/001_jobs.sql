DO $$ BEGIN CREATE TYPE job_source AS ENUM ('remotive', 'adzuna', 'themuse'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_type_enum AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'unknown'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE seniority_level AS ENUM ('intern', 'junior', 'mid', 'senior', 'lead', 'executive', 'unknown'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS jobs (
  id                    UUID PRIMARY KEY,
  source_id             VARCHAR(255) NOT NULL,
  source                job_source NOT NULL,
  title                 VARCHAR(500) NOT NULL,
  title_normalized      VARCHAR(500) NOT NULL,
  company_name          VARCHAR(255) NOT NULL,
  company_normalized    VARCHAR(255) NOT NULL,
  category              VARCHAR(255),
  job_type              job_type_enum NOT NULL DEFAULT 'unknown',
  seniority_level       seniority_level NOT NULL DEFAULT 'unknown',
  location_city         VARCHAR(255),
  location_state        VARCHAR(255),
  location_country      VARCHAR(100),
  is_remote             BOOLEAN NOT NULL DEFAULT FALSE,
  salary_min            INTEGER,
  salary_max            INTEGER,
  salary_is_estimated   BOOLEAN NOT NULL DEFAULT FALSE,
  posted_at             TIMESTAMPTZ NOT NULL,
  collected_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,

  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_normalized ON jobs(company_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at          ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_category           ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_seniority          ON jobs(seniority_level);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote          ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_location_country   ON jobs(location_country);
