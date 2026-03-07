# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (run without building)
npm run dev -- scan ./content --url https://example.com
npm run dev -- init ./my-site
npm run dev -- articles list --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- articles add ./my-article.mdx --site-dir D:/repos/innotekseoai/innotek-agenticseo-console --dry-run
npm run dev -- blog list --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- blog add ./my-post.md --site-dir D:/repos/innotekseoai/innotek-agenticseo-console --dry-run

# Build (tsc + copy templates to dist/)
npm run build

# Tests (vitest)
npm test
npm run test:watch

# Publish (runs build automatically)
npm publish
```

The `dev` script uses `tsx` to run TypeScript directly.

## Architecture

This is a Node.js CLI built with `commander`. Entry point: `src/index.ts`.

**Four command groups:**
- `scan <directory>` — walks `.md`/`.mdx` files, parses YAML frontmatter via `gray-matter`, and writes an `llms.txt` file
- `init <output-dir>` — scaffolds a Next.js article site by copying/rendering template files
- `articles list|add` — reads/writes `.mdx` files in `<site-dir>/content/articles/`
- `blog list|add` — reads/writes `<site-dir>/lib/config/blog-posts.json`

**Data flow for `scan`:**
```
scanDirectory() [md-scanner.ts]  →  ScannedFile[]
toEntries()     [md-scanner.ts]  →  LlmsEntry[]
buildLlmsTxt()  [llms-builder.ts] →  string  →  file or stdout
```

**`toEntries` pathPrefix:** accepts optional 3rd argument (default `'articles'`). Custom prefix used by blog routes.

**Site directory resolution (`site-locator.ts`):**
Priority: explicit `--site-dir` arg → `INNOTEKSEO_SITE_DIR` env var → auto-detect sibling `../innotekseoai/innotek-agenticseo-console`.
Validates that dir contains `content/articles/` and `lib/config/blog-posts.json`.

**blog-posts.json format:** JSON array of objects sorted by date descending:
```json
[{ "title": "...", "slug": "...", "date": "YYYY-MM-DD", "category": "...", "tags": [], "excerpt": "...", "content": "..." }]
```

**Shared frontmatter schema** (`frontmatter-validator.ts`):
- Required: `title`, `date`
- Warned: `excerpt`, `category`, `emoji`, `readTime`

**Templates** (`src/templates/`) are excluded from TypeScript compilation and copied verbatim to `dist/templates/` by the `copy-templates` script. The scaffolder resolves them at runtime via `path.join(__dirname, '..', 'templates')`. Template files use `.tpl` extension; `{{KEY}}` placeholders are replaced by `scaffolder.ts`.

**Build output:** `dist/` (CommonJS, ES2020 target). The `bin` entry points to `dist/index.js`.
