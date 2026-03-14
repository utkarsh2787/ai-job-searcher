import { Producer } from 'kafkajs';
import { createKafkaClient } from '@job-platform/shared-config';
import { ProcessedJobEvent, DeadLetterEvent } from '@job-platform/shared-types';
import { config } from '../config';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (producer) return producer;

  const kafka = createKafkaClient([config.KAFKA_BROKERS], 'job-processor-producer');
  producer = kafka.producer();
  await producer.connect();
  console.log('[kafka] Producer connected');
  return producer;
}

export async function publishProcessedJob(event: ProcessedJobEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: config.KAFKA_TOPIC_PROCESSED,
    messages: [
      {
        key:   event.job.jobId,
        value: JSON.stringify(event),
        headers: {
          eventType:     event.eventType,
          source:        event.source,
          schemaVersion: event.schemaVersion,
          isFirstSeen:   String(event.processing.isFirstSeen),
        },
      },
    ],
  });
}

export async function publishDeadLetter(event: DeadLetterEvent): Promise<void> {
  const p = await getProducer();
  await p.send({
    topic: config.KAFKA_TOPIC_DEAD_LETTER,
    messages: [
      {
        key:   event.originalEventId,
        value: JSON.stringify(event),
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
