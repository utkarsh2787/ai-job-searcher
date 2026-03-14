import * as dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log('═══════════════════════════════════');
  console.log('  Search API Service starting      ');
  console.log('═══════════════════════════════════');
  console.log(`  Listening on http://localhost:${config.PORT}`);
  console.log('');
  console.log('  Endpoints:');
  console.log(`  GET /api/jobs/search`);
  console.log(`  GET /api/jobs/:id`);
  console.log(`  GET /api/analytics/skills`);
  console.log(`  GET /api/analytics/companies`);
  console.log(`  GET /api/analytics/salary`);
  console.log(`  GET /api/analytics/growth`);
  console.log(`  GET /api/analytics/locations`);
  console.log(`  GET /api/analytics/stats`);
  console.log(`  GET /health`);
  console.log('═══════════════════════════════════');
});

process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
