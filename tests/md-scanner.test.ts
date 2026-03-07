import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { scanDirectory, toEntries } from '../src/lib/md-scanner';

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'innotekseo-test-'));

  fs.writeFileSync(
    path.join(tmpDir, 'article-one.mdx'),
    '---\ntitle: Article One\ndate: 2025-01-01\ncategory: SEO\n---\n\nBody text here.',
  );
  fs.writeFileSync(
    path.join(tmpDir, 'article-two.md'),
    '---\ntitle: Article Two\ndate: 2025-02-01\nexcerpt: Custom excerpt\n---\n\nMore content.',
  );
  fs.writeFileSync(path.join(tmpDir, 'ignored.txt'), 'This should be ignored.');

  const subDir = path.join(tmpDir, 'sub');
  fs.mkdirSync(subDir);
  fs.writeFileSync(
    path.join(subDir, 'nested.md'),
    '---\ntitle: Nested\ndate: 2025-03-01\n---\n\nNested content.',
  );
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('scanDirectory', () => {
  it('skips non-.md/.mdx files', () => {
    const files = scanDirectory(tmpDir);
    const paths = files.map((f) => f.filePath);
    expect(paths.some((p) => p.endsWith('.txt'))).toBe(false);
  });

  it('finds .md and .mdx files', () => {
    const files = scanDirectory(tmpDir);
    expect(files.length).toBe(2);
  });

  it('correctly parses frontmatter', () => {
    const files = scanDirectory(tmpDir);
    const one = files.find((f) => f.slug === 'article-one');
    expect(one?.frontmatter.title).toBe('Article One');
    expect(one?.frontmatter.category).toBe('SEO');
  });

  it('uses frontmatter excerpt when present', () => {
    const files = scanDirectory(tmpDir);
    const two = files.find((f) => f.slug === 'article-two');
    expect(two?.excerpt).toBe('Custom excerpt');
  });

  it('generates excerpt from body when not in frontmatter', () => {
    const files = scanDirectory(tmpDir);
    const one = files.find((f) => f.slug === 'article-one');
    expect(one?.excerpt).toContain('Body text');
  });

  it('does not recurse by default', () => {
    const files = scanDirectory(tmpDir);
    expect(files.some((f) => f.slug === 'nested')).toBe(false);
  });

  it('recurses when recursive=true', () => {
    const files = scanDirectory(tmpDir, true);
    expect(files.some((f) => f.slug === 'nested')).toBe(true);
  });

  it('rejects directory traversal', () => {
    expect(() => scanDirectory(path.join(tmpDir, '..', '..'), false, tmpDir)).toThrow(
      /traversal/i,
    );
  });
});

describe('toEntries', () => {
  it('uses default articles path prefix', () => {
    const files = scanDirectory(tmpDir);
    const entries = toEntries(files, 'https://example.com');
    expect(entries[0].url).toMatch(/\/articles\//);
  });

  it('respects custom pathPrefix', () => {
    const files = scanDirectory(tmpDir);
    const entries = toEntries(files, 'https://example.com', 'blog');
    expect(entries[0].url).toMatch(/\/blog\//);
  });

  it('strips trailing slash from base URL', () => {
    const files = scanDirectory(tmpDir);
    const entries = toEntries(files, 'https://example.com/');
    expect(entries[0].url).not.toContain('//articles');
  });

  it('uses slug as title fallback when frontmatter title missing', () => {
    const noTitle = [{ filePath: '/x/my-slug.md', slug: 'my-slug', frontmatter: {}, excerpt: '' }];
    const entries = toEntries(noTitle, 'https://example.com');
    expect(entries[0].title).toBe('my-slug');
  });
});
