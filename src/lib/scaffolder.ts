import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

interface ScaffoldOptions {
  outputDir: string;
  skipInstall: boolean;
}

function writeTemplate(
  templateName: string,
  destPath: string,
  replacements: Record<string, string> = {},
) {
  const tplPath = path.join(TEMPLATES_DIR, templateName);
  let content = fs.readFileSync(tplPath, 'utf-8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content, 'utf-8');
}

function copyTemplate(templateName: string, destPath: string) {
  const tplPath = path.join(TEMPLATES_DIR, templateName);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(tplPath, destPath);
}

export function scaffold({ outputDir, skipInstall }: ScaffoldOptions) {
  const d = path.resolve(outputDir);

  if (fs.existsSync(d) && fs.readdirSync(d).length > 0) {
    console.error(`\x1b[31mError:\x1b[0m Directory is not empty: ${d}`);
    process.exit(1);
  }

  fs.mkdirSync(d, { recursive: true });

  writeTemplate('package.json.tpl', path.join(d, 'package.json'));
  copyTemplate('next.config.ts.tpl', path.join(d, 'next.config.ts'));
  copyTemplate('tsconfig.json.tpl', path.join(d, 'tsconfig.json'));
  writeTemplate('globals.css.tpl', path.join(d, 'src', 'app', 'globals.css'));
  copyTemplate('articles-lib.ts.tpl', path.join(d, 'src', 'lib', 'articles.ts'));
  copyTemplate(
    'example-article.md',
    path.join(d, 'content', 'articles', 'getting-started.mdx'),
  );

  console.log(`\x1b[32m✓\x1b[0m Scaffolded project at ${d}`);

  if (!skipInstall) {
    const { execSync } = require('child_process') as typeof import('child_process');
    console.log('\x1b[36m⟳\x1b[0m Running npm install...');
    try {
      execSync('npm install', { cwd: d, stdio: 'inherit' });
      console.log('\x1b[32m✓\x1b[0m Dependencies installed');
    } catch {
      console.warn('\x1b[33mWarning:\x1b[0m npm install failed — run it manually');
    }
  }

  console.log('');
  console.log('\x1b[32m✓ Done!\x1b[0m');
  console.log(`  cd ${d}`);
  console.log('  npm run dev');
  console.log('  → Drop .mdx files into content/articles/ — nav auto-updates');
  console.log('');
  console.log('\x1b[35m→ Want automated, multi-page AI compliance?\x1b[0m');
  console.log('  Innotek Enterprise: https://innotekseoai.com/pricing');
  console.log('');
}
