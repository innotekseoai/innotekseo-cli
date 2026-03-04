import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { scanDirectory, toEntries } from '../lib/md-scanner';
import { buildLlmsTxt } from '../lib/llms-builder';

export const scanCommand = new Command('scan')
  .description('Scan a directory of markdown files and generate llms.txt')
  .argument('<directory>', 'Directory to scan for .md and .mdx files')
  .option('-o, --output <path>', 'Output file path', './llms.txt')
  .option('-u, --url <url>', 'Base URL of your site', 'https://example.com')
  .option('-r, --recursive', 'Scan subdirectories recursively', false)
  .option('--dry-run', 'Print to stdout only, do not write file', false)
  .action(
    (
      directory: string,
      options: { output: string; url: string; recursive: boolean; dryRun: boolean },
    ) => {
      const absDir = path.resolve(directory);
      if (!fs.existsSync(absDir)) {
        console.error(`\x1b[31mError:\x1b[0m Directory not found: ${absDir}`);
        process.exit(1);
      }

      console.log(`\x1b[36m⟳\x1b[0m Scanning ${absDir}...`);
      const files = scanDirectory(absDir, options.recursive);

      if (files.length === 0) {
        console.warn('\x1b[33mWarning:\x1b[0m No .md or .mdx files found.');
        return;
      }

      const entries = toEntries(files, options.url);
      const output = buildLlmsTxt(options.url, entries);

      if (options.dryRun) {
        console.log('\n' + output);
      } else {
        const outPath = path.resolve(options.output);
        fs.writeFileSync(outPath, output, 'utf-8');
        console.log(`\x1b[32m✓\x1b[0m Generated ${entries.length} entries → ${outPath}`);
      }

      console.log('');
      console.log('\x1b[35m→ Want automated, multi-page AI compliance?\x1b[0m');
      console.log('  Innotek Enterprise: https://innotekseoai.com/pricing');
      console.log('');
    },
  );
