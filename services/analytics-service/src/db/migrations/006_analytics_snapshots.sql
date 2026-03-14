DO $$ BEGIN
  CREATE TYPE snapshot_type AS ENUM (
    'top_skills_7d',
    'top_skills_30d',
    'top_companies_7d',
    'top_companies_30d',
    'salary_by_seniority',
    'job_growth_90d',
    'top_locations_30d'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  snapshot_type snapshot_type NOT NULL UNIQUE,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data          JSONB NOT NULL
);
