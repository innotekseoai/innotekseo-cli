import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { resolveSiteDir } from '../src/lib/site-locator';

let validSiteDir: string;

beforeAll(() => {
  validSiteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'innotekseo-site-'));
  fs.mkdirSync(path.join(validSiteDir, 'content', 'articles'), { recursive: true });
  fs.mkdirSync(path.join(validSiteDir, 'lib', 'config'), { recursive: true });
  fs.writeFileSync(path.join(validSiteDir, 'lib', 'config', 'blog-posts.json'), '[]');
});

afterAll(() => {
  fs.rmSync(validSiteDir, { recursive: true, force: true });
});

describe('resolveSiteDir', () => {
  it('resolves explicit valid path', () => {
    const result = resolveSiteDir(validSiteDir);
    expect(result).toBe(path.resolve(validSiteDir));
  });

  it('throws for non-existent explicit path', () => {
    expect(() => resolveSiteDir('/nonexistent/path/xyz')).toThrow(/not found/i);
  });

  it('throws for explicit path that is not a valid site dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'invalid-site-'));
    try {
      expect(() => resolveSiteDir(tmpDir)).toThrow(/does not look like/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('env var fallback', () => {
    const originalEnv = process.env.INNOTEKSEO_SITE_DIR;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.INNOTEKSEO_SITE_DIR;
      } else {
        process.env.INNOTEKSEO_SITE_DIR = originalEnv;
      }
    });

    it('resolves from INNOTEKSEO_SITE_DIR env var', () => {
      process.env.INNOTEKSEO_SITE_DIR = validSiteDir;
      const result = resolveSiteDir();
      expect(result).toBe(path.resolve(validSiteDir));
    });

    it('throws for invalid INNOTEKSEO_SITE_DIR', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bad-site-'));
      process.env.INNOTEKSEO_SITE_DIR = tmpDir;
      try {
        expect(() => resolveSiteDir()).toThrow(/INNOTEKSEO_SITE_DIR/);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  it('throws descriptive error when no site dir found', () => {
    // Skip if the real sibling site dir exists on this machine (CI / local dev)
    const siblingCandidates = [
      path.resolve('../innotekseoai/innotek-agenticseo-console'),
      path.resolve('../../innotekseoai/innotek-agenticseo-console'),
    ];
    const siblingExists = siblingCandidates.some((p) => {
      try {
        return (
          fs.existsSync(p) &&
          fs.existsSync(path.join(p, 'content', 'articles')) &&
          fs.existsSync(path.join(p, 'lib', 'config', 'blog-posts.json'))
        );
      } catch {
        return false;
      }
    });
    if (siblingExists) return;

    const origEnv = process.env.INNOTEKSEO_SITE_DIR;
    delete process.env.INNOTEKSEO_SITE_DIR;
    try {
      expect(() => resolveSiteDir()).toThrow(/Could not locate/);
    } finally {
      if (origEnv !== undefined) process.env.INNOTEKSEO_SITE_DIR = origEnv;
    }
  });
});
