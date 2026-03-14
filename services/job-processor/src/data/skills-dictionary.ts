// Canonical skills dictionary.
// Used for word-boundary regex matching against job titles + descriptions.
// All entries must be lowercase. Order matters for multi-word skills — longer first.

export const SKILLS: string[] = [
  // ── Languages ──────────────────────────────────────────────────────────────
  'typescript', 'javascript', 'python', 'go', 'golang', 'rust', 'java',
  'kotlin', 'swift', 'c#', 'c++', 'c', 'ruby', 'php', 'scala', 'elixir',
  'haskell', 'clojure', 'r', 'dart', 'lua', 'perl', 'groovy', 'julia',

  // ── Frontend frameworks / libs ─────────────────────────────────────────────
  'react', 'next.js', 'nextjs', 'vue', 'vue.js', 'nuxt', 'angular',
  'svelte', 'sveltekit', 'remix', 'astro', 'ember', 'backbone',
  'react native', 'flutter', 'ionic', 'electron',

  // ── State management ───────────────────────────────────────────────────────
  'redux', 'zustand', 'recoil', 'mobx', 'jotai', 'xstate', 'tanstack query',
  'react query', 'swr',

  // ── Backend frameworks ─────────────────────────────────────────────────────
  'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring boot',
  'spring', 'rails', 'ruby on rails', 'laravel', 'symfony', 'nest.js', 'nestjs',
  'hapi', 'koa', 'fastify', 'gin', 'echo', 'fiber', 'actix', 'axum',
  'phoenix', 'asp.net', '.net', 'dotnet',

  // ── Databases (relational) ─────────────────────────────────────────────────
  'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'oracle', 'mssql',
  'sql server', 'cockroachdb', 'planetscale',

  // ── Databases (NoSQL / document) ───────────────────────────────────────────
  'mongodb', 'mongoose', 'dynamodb', 'couchdb', 'firestore', 'fauna',
  'cassandra', 'scylladb',

  // ── Search ─────────────────────────────────────────────────────────────────
  'elasticsearch', 'opensearch', 'solr', 'algolia', 'meilisearch', 'typesense',

  // ── Caching / message queues ───────────────────────────────────────────────
  'redis', 'memcached', 'kafka', 'rabbitmq', 'activemq', 'sqs', 'sns',
  'pubsub', 'nats', 'pulsar',

  // ── Cloud platforms ────────────────────────────────────────────────────────
  'aws', 'gcp', 'google cloud', 'azure', 'cloudflare', 'vercel', 'netlify',
  'heroku', 'digital ocean', 'linode', 'fly.io',

  // ── AWS services ───────────────────────────────────────────────────────────
  'ec2', 'ecs', 'eks', 'lambda', 's3', 'rds', 'aurora', 'cloudfront',
  'cloudwatch', 'iam', 'route53', 'api gateway', 'step functions',

  // ── Containers / orchestration ─────────────────────────────────────────────
  'docker', 'kubernetes', 'k8s', 'helm', 'docker compose', 'podman',
  'openshift', 'rancher', 'argo', 'flux',

  // ── CI/CD ──────────────────────────────────────────────────────────────────
  'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis ci',
  'bitbucket pipelines', 'teamcity', 'drone', 'buildkite', 'tekton',

  // ── Infrastructure as code ─────────────────────────────────────────────────
  'terraform', 'pulumi', 'ansible', 'chef', 'puppet', 'cloudformation',
  'cdk', 'crossplane',

  // ── Observability ──────────────────────────────────────────────────────────
  'datadog', 'grafana', 'prometheus', 'jaeger', 'zipkin', 'opentelemetry',
  'splunk', 'new relic', 'sentry', 'pagerduty', 'elk stack',

  // ── Data engineering ───────────────────────────────────────────────────────
  'spark', 'flink', 'airflow', 'dbt', 'dagster', 'prefect', 'luigi',
  'hadoop', 'hive', 'presto', 'trino', 'databricks', 'snowflake',
  'bigquery', 'redshift', 'fivetran', 'stitch',

  // ── ML / AI ────────────────────────────────────────────────────────────────
  'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'sklearn', 'xgboost',
  'lightgbm', 'hugging face', 'langchain', 'openai', 'llm', 'mlflow',
  'kubeflow', 'vertex ai', 'sagemaker', 'numpy', 'pandas',

  // ── API / protocols ────────────────────────────────────────────────────────
  'graphql', 'rest', 'grpc', 'websockets', 'oauth', 'openapi', 'swagger',
  'trpc', 'soap',

  // ── Testing ────────────────────────────────────────────────────────────────
  'jest', 'vitest', 'pytest', 'cypress', 'playwright', 'selenium',
  'testing library', 'mocha', 'chai', 'supertest', 'junit', 'mockito',

  // ── Version control / code review ─────────────────────────────────────────
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'linear',

  // ── Security ───────────────────────────────────────────────────────────────
  'oauth2', 'jwt', 'saml', 'sso', 'zero trust', 'vault', 'pen testing',

  // ── Architecture / methodology ─────────────────────────────────────────────
  'microservices', 'event-driven', 'serverless', 'monorepo', 'domain-driven design',
  'ddd', 'cqrs', 'event sourcing', 'tdd', 'bdd', 'agile', 'scrum', 'kanban',

  // ── Web / tooling ──────────────────────────────────────────────────────────
  'webpack', 'vite', 'esbuild', 'rollup', 'turbopack', 'babel',
  'tailwindcss', 'tailwind', 'sass', 'css modules', 'styled components',
  'storybook', 'figma',

  // ── Mobile ─────────────────────────────────────────────────────────────────
  'android', 'ios', 'xcode', 'expo', 'capacitor',

  // ── Misc / runtime ─────────────────────────────────────────────────────────
  'linux', 'unix', 'bash', 'shell scripting', 'nginx', 'apache',
  'websocket', 'webassembly', 'wasm',
];

// Build a set for O(1) lookup (used by the extractor after matching)
export const SKILLS_SET = new Set(SKILLS);
