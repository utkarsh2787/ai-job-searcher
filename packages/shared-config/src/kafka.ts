import { Kafka, KafkaConfig, logLevel } from 'kafkajs';

export function createKafkaClient(brokers: string[], clientId: string): Kafka {
  const config: KafkaConfig = {
    clientId,
    brokers: brokers.flatMap((b) => b.split(',')),
    logLevel: logLevel.WARN,
    retry: {
      initialRetryTime: 300,
      retries: 10,
    },
  };
  return new Kafka(config);
}
