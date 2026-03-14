// Strips legal suffixes and normalizes to lowercase for deduplication.
// "Google LLC" → "google", "Meta Platforms, Inc." → "meta platforms"
// Keeps enough of the name to stay meaningful.

const LEGAL_SUFFIXES = [
  /,?\s*(inc\.?|incorporated)$/i,
  /,?\s*(llc\.?|l\.l\.c\.?)$/i,
  /,?\s*(ltd\.?|limited)$/i,
  /,?\s*(corp\.?|corporation)$/i,
  /,?\s*(co\.?|company)$/i,
  /,?\s*plc\.?$/i,
  /,?\s*gmbh\.?$/i,
  /,?\s*s\.?a\.?$/i,
  /,?\s*b\.?v\.?$/i,
  /,?\s*ag\.?$/i,
];

export function normalizeCompanyName(name: string): string {
  let normalized = name.trim();

  for (const suffix of LEGAL_SUFFIXES) {
    normalized = normalized.replace(suffix, '');
  }

  return normalized
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // strip punctuation
    .replace(/\s+/g, ' ')          // collapse whitespace
    .trim();
}
