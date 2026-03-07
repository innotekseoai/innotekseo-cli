import { describe, it, expect } from 'vitest';
import { buildLlmsTxt } from '../src/lib/llms-builder';

describe('buildLlmsTxt', () => {
  it('includes hostname in header', () => {
    const result = buildLlmsTxt('https://example.com', []);
    expect(result).toContain('example.com');
  });

  it('outputs correct format for zero entries', () => {
    const result = buildLlmsTxt('https://example.com', []);
    expect(result).toContain('GEO Content Directory');
    expect(result).toContain('Machine-readable');
    expect(result.trim().endsWith('')).toBe(true);
  });

  it('outputs one line per entry', () => {
    const entries = [
      { title: 'Post A', url: 'https://example.com/articles/a', summary: 'Summary A' },
      { title: 'Post B', url: 'https://example.com/articles/b', summary: 'Summary B' },
    ];
    const result = buildLlmsTxt('https://example.com', entries);
    expect(result).toContain('- [Post A](https://example.com/articles/a): Summary A');
    expect(result).toContain('- [Post B](https://example.com/articles/b): Summary B');
  });

  it('entry count matches', () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({
      title: `Post ${i}`,
      url: `https://example.com/articles/post-${i}`,
      summary: `Summary ${i}`,
    }));
    const result = buildLlmsTxt('https://example.com', entries);
    const lines = result.split('\n').filter((l) => l.startsWith('- '));
    expect(lines.length).toBe(5);
  });
});
