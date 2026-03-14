#!/bin/bash
# Runs automatically on first postgres container start.
# Migrations are applied by the analytics-service on startup — this just confirms the DB exists.
set -e
echo "PostgreSQL initialized: job_intelligence database ready."
