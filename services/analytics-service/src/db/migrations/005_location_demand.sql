CREATE TABLE IF NOT EXISTS location_daily_demand (
  id         BIGSERIAL PRIMARY KEY,
  city       VARCHAR(255),
  state      VARCHAR(255),
  country    VARCHAR(100) NOT NULL,
  date       DATE NOT NULL,
  job_count  INTEGER NOT NULL DEFAULT 0,

  UNIQUE (city, country, date)
);

CREATE INDEX IF NOT EXISTS idx_location_demand_country ON location_daily_demand(country);
CREATE INDEX IF NOT EXISTS idx_location_demand_date    ON location_daily_demand(date DESC);
