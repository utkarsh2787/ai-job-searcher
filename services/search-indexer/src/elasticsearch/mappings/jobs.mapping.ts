// Elasticsearch index mapping for the jobs index.
// Called once on startup — safe to call repeatedly (checks existence first).

export const JOBS_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      filter: {
        job_synonyms: {
          type: 'synonym',
          synonyms: [
            'swe, software engineer, software developer',
            'sre, site reliability engineer',
            'ml, machine learning',
            'ai, artificial intelligence',
            'frontend, front-end',
            'backend, back-end',
            'fullstack, full-stack, full stack',
            'devops, dev ops',
            'k8s, kubernetes',
          ],
        },
      },
      analyzer: {
        job_text_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'stop', 'job_synonyms'],
        },
      },
      normalizer: {
        lowercase_normalizer: {
          type: 'custom',
          filter: ['lowercase'],
        },
      },
    },
  },

  mappings: {
    dynamic: 'strict' as const,
    properties: {
      jobId:    { type: 'keyword' as const },
      sourceId: { type: 'keyword' as const },
      source:   { type: 'keyword' as const },
      sourceUrl: { type: 'keyword' as const, index: false },

      title: {
        type: 'text' as const,
        analyzer: 'job_text_analyzer',
        fields: { keyword: { type: 'keyword' as const } },
      },
      titleNormalized: { type: 'keyword' as const },

      description: {
        type: 'text' as const,
        analyzer: 'job_text_analyzer',
        term_vector: 'with_positions_offsets' as const,
      },

      company: {
        properties: {
          name: {
            type: 'text' as const,
            fields: { keyword: { type: 'keyword' as const } },
          },
          nameNormalized: { type: 'keyword' as const },
          logoUrl: { type: 'keyword' as const, index: false },
        },
      },

      location: {
        properties: {
          raw:        { type: 'keyword' as const },
          city:       { type: 'keyword' as const },
          state:      { type: 'keyword' as const },
          country:    { type: 'keyword' as const },
          isRemote:   { type: 'boolean' as const },
          remoteType: { type: 'keyword' as const },
        },
      },

      jobType:        { type: 'keyword' as const },
      seniorityLevel: { type: 'keyword' as const },
      category:       { type: 'keyword' as const },

      skills: {
        type: 'keyword' as const,
        normalizer: 'lowercase_normalizer',
      },

      salary: {
        properties: {
          raw:         { type: 'keyword' as const, index: false },
          min:         { type: 'integer' as const },
          max:         { type: 'integer' as const },
          currency:    { type: 'keyword' as const },
          period:      { type: 'keyword' as const },
          isEstimated: { type: 'boolean' as const },
        },
      },

      postedAt:    { type: 'date' as const },
      collectedAt: { type: 'date' as const },
      updatedAt:   { type: 'date' as const },
    },
  },
};
