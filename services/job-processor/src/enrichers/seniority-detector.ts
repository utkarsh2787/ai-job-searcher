import { SeniorityLevel } from '@job-platform/shared-types';

// Ordered from most specific to least specific.
// First match wins — so "staff engineer" doesn't accidentally match "junior staff".
const SENIORITY_RULES: Array<{ level: SeniorityLevel; patterns: RegExp[] }> = [
  {
    level: 'intern',
    patterns: [/\bintern\b/i, /\binternship\b/i, /\bco-op\b/i, /\bcoop\b/i],
  },
  {
    level: 'executive',
    patterns: [
      /\bvp\b/i, /\bvice president\b/i, /\bcto\b/i, /\bceo\b/i,
      /\bchief\b/i, /\bdirector\b/i, /\bhead of\b/i,
    ],
  },
  {
    level: 'lead',
    patterns: [
      /\blead\b/i, /\bstaff\b/i, /\bprincipal\b/i,
      /\barchitect\b/i, /\bmanager\b/i, /\btech lead\b/i,
    ],
  },
  {
    level: 'senior',
    patterns: [/\bsenior\b/i, /\bsr\b/i, /\bsr\.\b/i, /\b5\+\s*years?\b/i, /\b6\+\s*years?\b/i],
  },
  {
    level: 'mid',
    patterns: [
      /\bmid[\s-]?level\b/i, /\bii\b/, /\b2\b.*engineer/i,
      /\b3\+\s*years?\b/i, /\b4\+\s*years?\b/i,
    ],
  },
  {
    level: 'junior',
    patterns: [
      /\bjunior\b/i, /\bjr\b/i, /\bjr\.\b/i, /\bentry[\s-]?level\b/i,
      /\bassociate\b/i, /\b0[\s-]*1\s*years?\b/i, /\b1\+\s*years?\b/i,
    ],
  },
];

export function detectSeniority(title: string, description: string = ''): SeniorityLevel {
  // Check title first (more reliable signal), then fall back to description
  for (const { level, patterns } of SENIORITY_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(title)) return level;
    }
  }

  // Description fallback — only check first 500 chars to avoid false positives
  const descSnippet = description.slice(0, 500);
  for (const { level, patterns } of SENIORITY_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(descSnippet)) return level;
    }
  }

  return 'unknown';
}
