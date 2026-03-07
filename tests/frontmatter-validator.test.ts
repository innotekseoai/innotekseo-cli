import { describe, it, expect } from 'vitest';
import { validateFrontmatter } from '../src/lib/frontmatter-validator';

describe('validateFrontmatter', () => {
  it('passes valid frontmatter with all fields', () => {
    const result = validateFrontmatter({
      title: 'My Post',
      date: '2025-01-01',
      excerpt: 'An excerpt',
      category: 'SEO',
      emoji: '📊',
      readTime: '5 min read',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('fails when title is missing', () => {
    const result = validateFrontmatter({ date: '2025-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('fails when date is missing', () => {
    const result = validateFrontmatter({ title: 'My Post' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('date'))).toBe(true);
  });

  it('warns but does not fail when excerpt is missing', () => {
    const result = validateFrontmatter({ title: 'My Post', date: '2025-01-01' });
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('excerpt'))).toBe(true);
  });

  it('warns for each missing recommended field', () => {
    const result = validateFrontmatter({ title: 'My Post', date: '2025-01-01' });
    expect(result.warnings).toHaveLength(4); // excerpt, category, emoji, readTime
  });

  it('fails for both missing required fields', () => {
    const result = validateFrontmatter({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
