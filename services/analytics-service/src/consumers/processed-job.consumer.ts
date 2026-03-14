import { createKafkaClient } from '@job-platform/shared-config';
import { ProcessedJobEvent } from '@job-platform/shared-types';
import { getDb } from '../db/client';
import { recordSkillTrends } from '../aggregators/skill-trends.aggregator';
import { recordCompanyPosting } from '../aggregators/company-velocity.aggregator';
import { recordSalaryData } from '../aggregators/salary-insights.aggregator';
import { recordLocationDemand } from '../aggregators/location-demand.aggregator';
import { config } from '../config';

export async function startConsumer(): Promise<void> {
  const kafka = createKafkaClient([config.KAFKA_BROKERS], 'analytics-service-consumer');

  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: config.KAFKA_TOPIC_PROCESSED, numPartitions: 3 }],
  });
  await admin.disconnect();

  const consumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({
    topic: config.KAFKA_TOPIC_PROCESSED,
    fromBeginning: true,
  });

  console.log(`[kafka] Consumer subscribed to ${config.KAFKA_TOPIC_PROCESSED} (group: ${config.KAFKA_GROUP_ID})`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      let event: ProcessedJobEvent;
      try {
        event = JSON.parse(message.value.toString()) as ProcessedJobEvent;
      } catch {
        console.error('[analytics] Failed to parse message');
        return;
      }

      await processEvent(event);
    },
  });
}

async function processEvent(event: ProcessedJobEvent): Promise<void> {
  const { job } = event;

  try {
    // ── Step 1: Upsert job reference row ─────────────────────────────────────
    const jobRowId = await upsertJobReference(event);

    // ── Step 2: Run all aggregators in parallel ───────────────────────────────
    await Promise.all([
      recordSkillTrends(job),
      recordCompanyPosting(job),
      recordLocationDemand(job),
      jobRowId ? recordSalaryData(job, jobRowId) : Promise.resolve(),
    ]);

    console.log(`[analytics] Processed: ${job.company.name} | ${job.title.slice(0, 40)}`);
  } catch (err) {
    console.error('[analytics] Failed to process event:', err instanceof Error ? err.message : err);
  }
}

async function upsertJobReference(event: ProcessedJobEvent): Promise<string | null> {
  const sql = getDb();
  const { job } = event;

  try {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO jobs (
        id, source_id, source, title, title_normalized,
        company_name, company_normalized, category,
        job_type, seniority_level,
        location_city, location_state, location_country, is_remote,
        salary_min, salary_max, salary_is_estimated,
        posted_at, collected_at, updated_at
      )
      VALUES (
        ${job.jobId}::uuid,
        ${job.sourceId},
        ${event.source},
        ${job.title},
        ${job.titleNormalized},
        ${job.company.name},
        ${job.company.nameNormalized},
        ${job.category},
        ${job.jobType},
        ${job.seniorityLevel},
        ${job.location.city ?? null},
        ${job.location.state ?? null},
        ${job.location.country ?? null},
        ${job.location.isRemote},
        ${job.salary.min ?? null},
        ${job.salary.max ?? null},
        ${job.salary.isEstimated},
        ${job.postedAt}::timestamptz,
        ${job.collectedAt}::timestamptz,
        ${job.updatedAt}::timestamptz
      )
      ON CONFLICT (source, source_id)
      DO UPDATE SET
        title             = EXCLUDED.title,
        title_normalized  = EXCLUDED.title_normalized,
        salary_min        = EXCLUDED.salary_min,
        salary_max        = EXCLUDED.salary_max,
        updated_at        = EXCLUDED.updated_at,
        is_active         = TRUE
      RETURNING id
    `;

    return rows[0]?.id ?? null;
  } catch (err) {
    console.error('[analytics] Failed to upsert job reference:', err instanceof Error ? err.message : err);
    return null;
  }
}
