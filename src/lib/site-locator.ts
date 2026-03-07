import fs from 'fs';
import path from 'path';

const REQUIRED_PATHS = ['content/articles', 'lib/config/blog-posts.json'];

function isValidSiteDir(dir: string): boolean {
  return (
    fs.existsSync(dir) &&
    REQUIRED_PATHS.every((p) => fs.existsSync(path.join(dir, p)))
  );
}

const SIBLING_CANDIDATES = [
  '../innotekseoai/innotek-agenticseo-console',
  '../../innotekseoai/innotek-agenticseo-console',
];

export function resolveSiteDir(explicitPath?: string): string {
  if (explicitPath) {
    const resolved = path.resolve(explicitPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Site directory not found: ${resolved}`);
    }
    if (!isValidSiteDir(resolved)) {
      throw new Error(
        `Directory does not look like an innotekseoai site (missing content/articles/ or lib/config/blog-posts.json): ${resolved}`,
      );
    }
    return resolved;
  }

  const envDir = process.env.INNOTEKSEO_SITE_DIR;
  if (envDir) {
    const resolved = path.resolve(envDir);
    if (!isValidSiteDir(resolved)) {
      throw new Error(
        `INNOTEKSEO_SITE_DIR does not point to a valid site directory: ${resolved}`,
      );
    }
    return resolved;
  }

  for (const candidate of SIBLING_CANDIDATES) {
    const resolved = path.resolve(candidate);
    if (isValidSiteDir(resolved)) {
      return resolved;
    }
  }

  throw new Error(
    'Could not locate innotekseoai.com site directory.\n' +
      'Options:\n' +
      '  1. Pass --site-dir <path>\n' +
      '  2. Set INNOTEKSEO_SITE_DIR environment variable\n' +
      '  3. Place the innotekseoai repo as a sibling: ../innotekseoai/innotek-agenticseo-console',
  );
}
