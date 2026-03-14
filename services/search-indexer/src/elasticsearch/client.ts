import { Client } from '@elastic/elasticsearch';
import { config } from '../config';

let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    client = new Client({ node: config.ELASTICSEARCH_URL });
  }
  return client;
}

export async function waitForElasticsearch(retries = 10, delayMs = 3000): Promise<void> {
  const es = getElasticsearchClient();
  for (let i = 1; i <= retries; i++) {
    try {
      const health = await es.cluster.health({ wait_for_status: 'yellow', timeout: '10s' });
      console.log(`[elasticsearch] Cluster status: ${health.status}`);
      return;
    } catch (err) {
      console.log(`[elasticsearch] Not ready yet (attempt ${i}/${retries})...`);
      if (i === retries) throw new Error('Elasticsearch did not become ready in time');
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
