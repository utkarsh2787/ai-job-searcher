export interface NormalizedSalary {
  raw?: string;
  min?: number;
  max?: number;
  currency: string;
  period: 'annual' | 'hourly' | 'unknown';
  isEstimated: boolean;
}

// Handles both structured (Adzuna: min/max numbers) and
// unstructured (Remotive: "$80k - $120k / year") salary inputs.

export function normalizeSalaryText(raw: string): NormalizedSalary {
  if (!raw || raw.trim() === '') {
    return { currency: 'USD', period: 'unknown', isEstimated: true };
  }

  const text = raw.toLowerCase().trim();
  const currency = detectCurrency(text);
  const period = detectPeriod(text);

  // Extract all numeric values (handles 80k, 80,000, 80.5k)
  const numbers = extractNumbers(text);

  if (numbers.length === 0) {
    return { raw, currency, period, isEstimated: true };
  }

  let min = numbers[0];
  let max = numbers.length > 1 ? numbers[numbers.length - 1] : numbers[0];

  // Normalize hourly → annual (assuming 2080 hours/year)
  if (period === 'hourly') {
    min = Math.round(min * 2080);
    max = Math.round(max * 2080);
  }

  // If only one value found, treat as a midpoint ± 15%
  if (numbers.length === 1) {
    const mid = min;
    min = Math.round(mid * 0.85);
    max = Math.round(mid * 1.15);
    return { raw, min, max, currency, period: period === 'unknown' ? 'annual' : period, isEstimated: true };
  }

  return { raw, min, max, currency, period: period === 'unknown' ? 'annual' : period, isEstimated: false };
}

export function normalizeSalaryRange(
  salaryMin: number | undefined,
  salaryMax: number | undefined,
  currency = 'USD'
): NormalizedSalary {
  if (!salaryMin && !salaryMax) {
    return { currency, period: 'unknown', isEstimated: true };
  }

  const min = salaryMin ?? salaryMax!;
  const max = salaryMax ?? salaryMin!;

  return {
    min: Math.round(min),
    max: Math.round(max),
    currency,
    period: 'annual',
    isEstimated: false,
  };
}

function extractNumbers(text: string): number[] {
  // Match patterns like: 80k, 80,000, 80.5k, 120000
  const pattern = /\$?([\d,]+(?:\.\d+)?)\s*k?\b/gi;
  const results: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const raw = match[1].replace(/,/g, '');
    let value = parseFloat(raw);
    if (match[0].includes('k') || text.slice(match.index, match.index + match[0].length + 1).includes('k')) {
      value *= 1000;
    }
    if (value > 10 && value < 2_000_000) {
      results.push(value);
    }
  }

  return results;
}

function detectCurrency(text: string): string {
  if (text.includes('£') || text.includes('gbp')) return 'GBP';
  if (text.includes('€') || text.includes('eur')) return 'EUR';
  if (text.includes('cad')) return 'CAD';
  if (text.includes('aud')) return 'AUD';
  return 'USD';
}

function detectPeriod(text: string): 'annual' | 'hourly' | 'unknown' {
  if (/\bhour(ly)?\b|\/\s*hr\b|per\s+hour/i.test(text)) return 'hourly';
  if (/\byear(ly)?\b|annual|\/\s*yr\b|per\s+year/i.test(text)) return 'annual';
  return 'unknown';
}
