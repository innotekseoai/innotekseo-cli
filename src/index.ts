#!/usr/bin/env node
import { Command } from 'commander';
import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('innotek-seo')
  .description(
    'Free CLI for AI-first SEO — generate llms.txt and scaffold GEO article sites',
  )
  .version('1.0.0');

program.addCommand(scanCommand);
program.addCommand(initCommand);

program.parse(process.argv);
