import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { LlmsEntry } from './llms-builder';

export interface ScannedFile {
  filePath: string;
  slug: string;
  frontmatter: Record<string, unknown>;
  excerpt: string;
}

function walkDir(dir: string, recursive: boolean): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && recursive) {
      results.push(...walkDir(fullPath, recursive));
    } else if (stat.isFile() && (item.endsWith('.md') || item.endsWith('.mdx'))) {
      results.push(fullPath);
    }
  }
  return results;
}

export function scanDirectory(dir: string, recursive = false): ScannedFile[] {
  const files = walkDir(dir, recursive);
  return files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = path.basename(filePath, path.extname(filePath));
    const plainText = content
      .replace(/^#+\s+.*/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const excerpt =
      (data.excerpt as string) ||
      plainText.slice(0, 160) + (plainText.length > 160 ? '…' : '');
    return { filePath, slug, frontmatter: data as Record<string, unknown>, excerpt };
  });
}

export function toEntries(files: ScannedFile[], baseUrl: string): LlmsEntry[] {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return files.map((f) => ({
    title: (f.frontmatter.title as string) || f.slug,
    url: `${cleanBase}/articles/${f.slug}`,
    summary: f.excerpt,
  }));
}
