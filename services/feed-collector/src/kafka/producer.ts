import { Kafka, Producer } from 'kafkajs';
import { createKafkaClient } from '@job-platform/shared-config';
import { RawJobEvent } from '@job-platform/shared-types';
import { config } from '../config';

let producer: Producer | null = null;
let kafka: Kafka | null = null;

export async function getProducer(): Promise<Producer> {
  if (producer) return producer;

  kafka = createKafkaClient([config.KAFKA_BROKERS], 'feed-collector');

  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: config.KAFKA_TOPIC_RAW, numPartitions: 3 }],
  });
  await admin.disconnect();

  producer = kafka.producer();
  await producer.connect();
  console.log('[kafka] Producer connected');
  return producer;
}

export async function publishRawJob(event: RawJobEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: config.KAFKA_TOPIC_RAW,
    messages: [
      {
        key: `${event.source}:${event.sourceJobId}`,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          source: event.source,
          schemaVersion: event.schemaVersion,
        },
      },
    ],
  });
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
    console.log('[kafka] Producer disconnected');
  }
}
