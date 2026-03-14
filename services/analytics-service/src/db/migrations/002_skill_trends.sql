CREATE TABLE IF NOT EXISTS skill_daily_counts (
  id      BIGSERIAL PRIMARY KEY,
  skill   VARCHAR(100) NOT NULL,
  date    DATE NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,

  UNIQUE (skill, date)
);

CREATE INDEX IF NOT EXISTS idx_skill_daily_skill ON skill_daily_counts(skill);
CREATE INDEX IF NOT EXISTS idx_skill_daily_date  ON skill_daily_counts(date DESC);
