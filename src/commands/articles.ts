import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { resolveSiteDir } from '../lib/site-locator';
import { validateFrontmatter } from '../lib/frontmatter-validator';

export const articlesCommand = new Command('articles').description(
  'Manage articles in the innotekseoai.com site',
);

articlesCommand
  .command('list')
  .description('List all articles in the site')
  .option('--site-dir <path>', 'Path to innotekseoai.com site directory')
  .action((options: { siteDir?: string }) => {
    let siteDir: string;
    try {
      siteDir = resolveSiteDir(options.siteDir);
    } catch (err) {
      console.error(`\x1b[31mError:\x1b[0m ${(err as Error).message}`);
      process.exit(1);
    }

    const articlesDir = path.join(siteDir, 'content', 'articles');
    if (!fs.existsSync(articlesDir)) {
      console.error(`\x1b[31mError:\x1b[0m Articles directory not found: ${articlesDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(articlesDir)
      .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

    if (files.length === 0) {
      console.log('No articles found.');
      return;
    }

    console.log('\x1b[36mArticles:\x1b[0m\n');
    const colW = [40, 22, 12, 10];
    const header = [
      'Title'.padEnd(colW[0]),
      'Category'.padEnd(colW[1]),
      'Date'.padEnd(colW[2]),
      'Slug',
    ].join('  ');
    console.log(header);
    console.log('-'.repeat(header.length));

    for (const file of files) {
      const raw = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
      const { data } = matter(raw);
      const slug = path.basename(file, path.extname(file));
      const title = String(data.title ?? slug).slice(0, colW[0] - 1).padEnd(colW[0]);
      const category = String(data.category ?? '').slice(0, colW[1] - 1).padEnd(colW[1]);
      const date = String(data.date ?? '').slice(0, colW[2] - 1).padEnd(colW[2]);
      console.log(`${title}  ${category}  ${date}  ${slug}`);
    }

    console.log(`\n\x1b[32m${files.length} article(s)\x1b[0m`);
  });

articlesCommand
  .command('add <file>')
  .description('Add an article to the site')
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
    const { data } = matter(raw);
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

    let siteDir: string;
    try {
      siteDir = resolveSiteDir(options.siteDir);
    } catch (err) {
      console.error(`\x1b[31mError:\x1b[0m ${(err as Error).message}`);
      process.exit(1);
    }

    const slug = path.basename(absFile, ext);
    const destDir = path.join(siteDir, 'content', 'articles');
    const destFile = path.join(destDir, `${slug}.mdx`);

    if (fs.existsSync(destFile)) {
      console.error(`\x1b[31mError:\x1b[0m Article already exists: ${destFile}`);
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(`\x1b[36m[dry-run]\x1b[0m Would copy ${absFile} → ${destFile}`);
      return;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(absFile, destFile);
    console.log(`\x1b[32m✓\x1b[0m Article added: ${destFile}`);
    console.log(`  Slug: ${slug}`);
    console.log('  Rebuild the site to publish: npm run build');
  });
