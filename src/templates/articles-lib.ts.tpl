import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

export interface ArticleMeta {
  slug: string;
  title: string;
  category: string;
  emoji: string;
  date: string;
  excerpt: string;
  readTime: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, '');
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf-8');
      const { data } = matter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        category: (data.category as string) || 'General',
        emoji: (data.emoji as string) || '📄',
        date: (data.date as string) || '',
        excerpt: (data.excerpt as string) || '',
        readTime: (data.readTime as string) || '5 min read',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticle(slug: string): Article | null {
  const candidates = [
    path.join(ARTICLES_DIR, `${slug}.mdx`),
    path.join(ARTICLES_DIR, `${slug}.md`),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);
      return {
        slug,
        title: (data.title as string) || slug,
        category: (data.category as string) || 'General',
        emoji: (data.emoji as string) || '📄',
        date: (data.date as string) || '',
        excerpt: (data.excerpt as string) || '',
        readTime: (data.readTime as string) || '5 min read',
        content,
      };
    }
  }
  return null;
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => f.replace(/\.(mdx|md)$/, ''));
}
