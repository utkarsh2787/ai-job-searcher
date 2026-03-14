CREATE TABLE IF NOT EXISTS company_daily_postings (
  id                    BIGSERIAL PRIMARY KEY,
  company_normalized    VARCHAR(255) NOT NULL,
  company_display       VARCHAR(255) NOT NULL,
  date                  DATE NOT NULL,
  posting_count         INTEGER NOT NULL DEFAULT 0,

  UNIQUE (company_normalized, date)
);

CREATE INDEX IF NOT EXISTS idx_company_postings_normalized ON company_daily_postings(company_normalized);
CREATE INDEX IF NOT EXISTS idx_company_postings_date       ON company_daily_postings(date DESC);
