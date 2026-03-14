import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RawJobEvent, AdzunaRawJob } from '@job-platform/shared-types';
import { publishRawJob } from '../kafka/producer';
import { config } from '../config';

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

interface AdzunaResponse {
  results: AdzunaRawJob[];
  count: number;
}

export async function collectAdzuna(): Promise<void> {
  console.log('[adzuna] Starting collection...');

  let totalPublished = 0;

  // Fetch two pages (10 results each on free tier) across key categories
  const searches = [
    { what: 'software engineer', category: 'it-jobs' },
    { what: 'data engineer', category: 'it-jobs' },
    { what: 'frontend developer', category: 'it-jobs' },
    { what: 'backend developer', category: 'it-jobs' },
    { what: 'devops engineer', category: 'it-jobs' },
  ];

  for (const search of searches) {
    for (let page = 1; page <= 2; page++) {
      try {
        const url = `${BASE_URL}/${config.ADZUNA_COUNTRY}/search/${page}`;
        const response = await axios.get<AdzunaResponse>(url, {
          params: {
            app_id:           config.ADZUNA_APP_ID,
            app_key:          config.ADZUNA_APP_KEY,
            what:             search.what,
            category:         search.category,
            results_per_page: 10,
          },
          timeout: 15000,
        });

        const jobs = response.data.results ?? [];
        console.log(`[adzuna] Fetched ${jobs.length} jobs for "${search.what}" page ${page}`);

        for (const job of jobs) {
          const event: RawJobEvent = {
            eventId: uuidv4(),
            eventType: 'job.raw',
            schemaVersion: '1.0',
            producedAt: new Date().toISOString(),
            source: 'adzuna',
            sourceJobId: job.id,
            payload: job,
          };

          await publishRawJob(event);
          totalPublished++;
        }

        // Small delay to stay within rate limits
        await sleep(500);
      } catch (err) {
        console.error(`[adzuna] Failed "${search.what}" page ${page}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`[adzuna] Collection complete. Published ${totalPublished} events.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
