CREATE TABLE IF NOT EXISTS salary_data_points (
  id                BIGSERIAL PRIMARY KEY,
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title_normalized  VARCHAR(500) NOT NULL,
  seniority_level   seniority_level NOT NULL,
  category          VARCHAR(255),
  location_country  VARCHAR(100),
  is_remote         BOOLEAN NOT NULL,
  salary_min        INTEGER NOT NULL,
  salary_max        INTEGER NOT NULL,
  salary_mid        INTEGER GENERATED ALWAYS AS ((salary_min + salary_max) / 2) STORED,
  recorded_at       DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_salary_seniority  ON salary_data_points(seniority_level);
CREATE INDEX IF NOT EXISTS idx_salary_category   ON salary_data_points(category);
CREATE INDEX IF NOT EXISTS idx_salary_country    ON salary_data_points(location_country);
CREATE INDEX IF NOT EXISTS idx_salary_mid        ON salary_data_points(salary_mid);
CREATE INDEX IF NOT EXISTS idx_salary_recorded   ON salary_data_points(recorded_at DESC);
