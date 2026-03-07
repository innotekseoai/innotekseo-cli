import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { resolveSiteDir } from '../lib/site-locator';
import { validateFrontmatter } from '../lib/frontmatter-validator';

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
}

export const blogCommand = new Command('blog').description(
  'Manage blog posts in the innotekseoai.com site',
);

blogCommand
  .command('list')
  .description('List all blog posts')
  .option('--site-dir <path>', 'Path to innotekseoai.com site directory')
  .action((options: { siteDir?: string }) => {
    let siteDir: string;
    try {
      siteDir = resolveSiteDir(options.siteDir);
    } catch (err) {
      console.error(`\x1b[31mError:\x1b[0m ${(err as Error).message}`);
      process.exit(1);
    }

    const blogJsonPath = path.join(siteDir, 'lib', 'config', 'blog-posts.json');
    if (!fs.existsSync(blogJsonPath)) {
      console.error(`\x1b[31mError:\x1b[0m blog-posts.json not found: ${blogJsonPath}`);
      process.exit(1);
    }

    const posts: BlogPost[] = JSON.parse(fs.readFileSync(blogJsonPath, 'utf-8'));

    if (posts.length === 0) {
      console.log('No blog posts found.');
      return;
    }

    console.log('\x1b[36mBlog posts:\x1b[0m\n');
    const colW = [40, 30, 12, 20];
    const header = [
      'Title'.padEnd(colW[0]),
      'Slug'.padEnd(colW[1]),
      'Date'.padEnd(colW[2]),
      'Category',
    ].join('  ');
    console.log(header);
    console.log('-'.repeat(header.length));

    for (const post of posts) {
      const title = String(post.title ?? '').slice(0, colW[0] - 1).padEnd(colW[0]);
      const slug = String(post.slug ?? '').slice(0, colW[1] - 1).padEnd(colW[1]);
      const date = String(post.date ?? '').slice(0, colW[2] - 1).padEnd(colW[2]);
      const category = String(post.category ?? '');
      console.log(`${title}  ${slug}  ${date}  ${category}`);
    }

    console.log(`\n\x1b[32m${posts.length} post(s)\x1b[0m`);
  });

blogCommand
  .command('add <file>')
  .description('Add a blog post to the site')
  .option('--site-dir <path>', 'Path to innotekseoai.com site directory')
  .option('--dry-run', 'Preview without writing', false)
  .action((file: string, options: { siteDir?: string; dryRun: boolean }) => {
    const absFile = path.resolve(file);

    if (!fs.existsSync(absFile)) {
      console.error(`\x1b[31mError:\x1b[0m File not found: ${absFile}`);
      process.exit(1);
    }

    const ext = path.extname(absFile);
    if (ext !== '.md' && ext !== '.mdx') {
      console.error(`\x1b[31mError:\x1b[0m File must be .md or .mdx, got: ${ext}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(absFile, 'utf-8');
    const { data, content } = matter(raw);
    const validation = validateFrontmatter(data as Record<string, unknown>);

    if (!validation.valid) {
      console.error('\x1b[31mFrontmatter validation failed:\x1b[0m');
      for (const err of validation.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }

    for (const warn of validation.warnings) {
      console.warn(`\x1b[33mWarning:\x1b[0m ${warn}`);
    }

    const slug =
      String(data.slug ?? '').trim() ||
      path.basename(absFile, ext);

    let siteDir: string;
    try {
      siteDir = resolveSiteDir(options.siteDir);
    } catch (err) {
      console.error(`\x1b[31mError:\x1b[0m ${(err as Error).message}`);
      process.exit(1);
    }

    const blogJsonPath = path.join(siteDir, 'lib', 'config', 'blog-posts.json');
    const posts: BlogPost[] = JSON.parse(fs.readFileSync(blogJsonPath, 'utf-8'));

    if (posts.some((p) => p.slug === slug)) {
      console.error(`\x1b[31mError:\x1b[0m Blog post with slug "${slug}" already exists`);
      process.exit(1);
    }

    const newPost: BlogPost = {
      title: String(data.title),
      slug,
      date: String(data.date),
      ...(data.author ? { author: String(data.author) } : {}),
      ...(data.category ? { category: String(data.category) } : {}),
      ...(Array.isArray(data.tags) ? { tags: data.tags as string[] } : {}),
      ...(data.excerpt ? { excerpt: String(data.excerpt) } : {}),
      content: content.trim(),
    };

    if (options.dryRun) {
      console.log('\x1b[36m[dry-run]\x1b[0m Would add post:');
      console.log(JSON.stringify(newPost, null, 2));
      return;
    }

    const updated = [...posts, newPost].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    fs.writeFileSync(blogJsonPath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
    console.log(`\x1b[32m✓\x1b[0m Blog post added: "${newPost.title}" (slug: ${slug})`);
    console.log('  Rebuild the site to publish: npm run build');
  });
