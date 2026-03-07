#!/usr/bin/env node
import { Command } from 'commander';
import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';
import { articlesCommand } from './commands/articles';
import { blogCommand } from './commands/blog';

const program = new Command();

program
  .name('innotekseo')
  .description(
    'Free CLI for AI-first SEO — generate llms.txt and scaffold GEO article sites',
  )
  .version('1.0.0');

program.addCommand(scanCommand);
program.addCommand(initCommand);
program.addCommand(articlesCommand);
program.addCommand(blogCommand);

program.parse(process.argv);
