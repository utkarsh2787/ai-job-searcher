#!/bin/bash
set -e

echo "── Job Intelligence Platform Setup ──"
echo ""

# 1. Copy env files
echo "→ Creating .env files from examples..."
cp -n .env.example .env 2>/dev/null || echo "  .env already exists, skipping"

for service in feed-collector job-processor search-indexer analytics-service search-api; do
  cp -n services/$service/.env.example services/$service/.env 2>/dev/null \
    || echo "  services/$service/.env already exists, skipping"
done

cp -n frontend/.env.example frontend/.env.local 2>/dev/null \
  || echo "  frontend/.env.local already exists, skipping"

echo ""

# 2. Install dependencies
echo "→ Installing npm dependencies..."
npm install

echo ""

# 3. Build shared packages
echo "→ Building shared packages..."
npm run build --workspace=packages/shared-types
npm run build --workspace=packages/shared-config

echo ""

# 4. Start infrastructure
echo "→ Starting infrastructure (Kafka, Elasticsearch, Postgres, Redis)..."
docker compose -f infra/docker-compose.yml up -d

echo ""
echo "→ Waiting for services to be healthy (this takes ~30s)..."
sleep 30

echo ""
echo "✓ Setup complete."
echo ""
echo "  Kafka UI:       http://localhost:8080"
echo "  Kibana:         http://localhost:5601"
echo "  Elasticsearch:  http://localhost:9200"
echo "  Postgres:       localhost:5432  (user: jip_user, db: job_intelligence)"
echo "  Redis:          localhost:6379"
echo ""
echo "Next steps:"
echo "  1. Fill in your API keys in services/feed-collector/.env"
echo "  2. Run: npm run dev:collector"
echo "  3. Watch events flow in Kafka UI: http://localhost:8080"
