import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Validates req.query against a zod schema.
// Returns 400 with structured error details on failure.
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: result.error.errors.map((e) => ({
          field:   e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    // Attach parsed (coerced/defaulted) values back to req.query
    req.query = result.data as Record<string, string>;
    next();
  };
}

// ── Query schemas ─────────────────────────────────────────────────────────────

export const jobSearchSchema = z.object({
  q:          z.string().max(200).optional(),
  page:       z.coerce.number().int().min(1).max(100).default(1),
  pageSize:   z.coerce.number().int().min(1).max(50).default(20),
  remote:     z.enum(['true', 'false']).optional(),
  jobType:    z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  seniority:  z.enum(['intern', 'junior', 'mid', 'senior', 'lead', 'executive']).optional(),
  skills:     z.string().optional(),       // comma-separated: "typescript,react"
  company:    z.string().max(100).optional(),
  location:   z.string().max(100).optional(),
  salaryMin:  z.coerce.number().int().min(0).optional(),
  salaryMax:  z.coerce.number().int().min(0).optional(),
  sortBy:     z.enum(['relevance', 'date', 'salary']).default('relevance'),
  postedWithin: z.coerce.number().int().min(1).max(365).optional(), // days
});

export const analyticsSkillsSchema = z.object({
  period: z.enum(['7d', '30d']).default('7d'),
});

export const analyticsCompaniesSchema = z.object({
  period: z.enum(['7d', '30d']).default('30d'),
});

export type JobSearchParams = z.infer<typeof jobSearchSchema>;
