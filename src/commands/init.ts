import { Command } from 'commander';
import { scaffold } from '../lib/scaffolder';

export const initCommand = new Command('init')
  .description('Scaffold a new innotekseo-articles Next.js project')
  .argument('<output-dir>', 'Directory to create the project in')
  .option('--skip-install', 'Skip npm install after scaffolding', false)
  .action((outputDir: string, options: { skipInstall: boolean }) => {
    scaffold({ outputDir, skipInstall: options.skipInstall });
  });
