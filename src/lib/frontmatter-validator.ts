export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_FIELDS = ['title', 'date'] as const;
const WARNED_FIELDS = ['excerpt', 'category', 'emoji', 'readTime'] as const;

export function validateFrontmatter(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  for (const field of WARNED_FIELDS) {
    if (!data[field] || String(data[field]).trim() === '') {
      warnings.push(`Missing recommended field: ${field}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
