import { SKILLS } from '../data/skills-dictionary';

// Pre-compile regex patterns once at startup for performance.
// Each skill gets a word-boundary pattern so "go" doesn't match "good" or "ago".
// Special characters in skill names (e.g. "c++", "c#", ".net") are escaped.
const SKILL_PATTERNS: Array<{ skill: string; pattern: RegExp }> = SKILLS.map(
  (skill) => ({
    skill,
    pattern: new RegExp(
      `(?<![\\w.])${escapeRegex(skill)}(?![\\w.])`,
      'i'
    ),
  })
);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSkills(title: string, description: string): string[] {
  // Combine title + description for matching, weight title higher by repeating it
  const searchText = `${title} ${title} ${title} ${description}`.toLowerCase();

  const matched: string[] = [];

  for (const { skill, pattern } of SKILL_PATTERNS) {
    if (pattern.test(searchText)) {
      matched.push(skill);
    }
  }

  // Deduplicate (e.g. "nodejs" and "node.js" might both match)
  return deduplicateSkills(matched);
}

// Remove near-duplicate skills (e.g. keep "node.js", drop "nodejs")
function deduplicateSkills(skills: string[]): string[] {
  const aliases: Record<string, string> = {
    nodejs:       'node.js',
    nextjs:       'next.js',
    nestjs:       'nest.js',
    golang:       'go',
    postgres:     'postgresql',
    sklearn:      'scikit-learn',
    k8s:          'kubernetes',
    tailwind:     'tailwindcss',
    dotnet:       '.net',
  };

  const seen = new Set<string>();
  const result: string[] = [];

  for (const skill of skills) {
    const canonical = aliases[skill] ?? skill;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
}
