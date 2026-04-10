# CLAUDE.md

Guidance for Claude Code when working in this repository.

---

## ⚠️ Superseded by @innotekseo/console

This package (`@innotekseo/cli`) has been **superseded** by [`@innotekseo/console`](https://github.com/innotekseoai/innotekseo-console). The console is a full AI-powered terminal TUI with an agent loop, MCP integration, and all the functionality this CLI offered plus much more.

**Key implications:**
- The `innotekseo` bin name now belongs to `@innotekseo/console`
- Do NOT publish new versions of this package that claim the `innotekseo` bin
- This repo is kept for reference only — no new features should be added
- If a user asks about publishing or updating this CLI, direct them to `innotekseo-console` instead

---

## Quick-reference commands

```bash
# Run any command without building (tsx compiles on-the-fly)
npm run dev -- <command> [args]

# Build (tsc → dist/ + copy templates)
npm run build

# Tests
npm test            # vitest run (single pass)
npm run test:watch  # vitest watch mode

# Publish to npm (runs build automatically)
npm publish
```

### Dev invocation examples

```bash
# llms.txt generation
npm run dev -- scan ./content/articles --url https://innotekseoai.com
npm run dev -- scan ./content --url https://innotekseoai.com --recursive --dry-run
npm run dev -- scan ./content --url https://innotekseoai.com --output ./public/llms.txt

# Scaffold a new Next.js article site
npm run dev -- init ./my-article-site
npm run dev -- init ./my-article-site --skip-install

# Article management (innotekseoai.com site)
npm run dev -- articles list --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- articles add ./my-article.mdx --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- articles add ./my-article.mdx --site-dir D:/repos/innotekseoai/innotek-agenticseo-console --dry-run

# Blog post management (innotekseoai.com site)
npm run dev -- blog list --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- blog add ./my-post.md --site-dir D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- blog add ./my-post.md --site-dir D:/repos/innotekseoai/innotek-agenticseo-console --dry-run

# Or use the env var instead of repeating --site-dir
export INNOTEKSEO_SITE_DIR=D:/repos/innotekseoai/innotek-agenticseo-console
npm run dev -- articles list
npm run dev -- blog list

# WordPress publishing (WP-CLI transport)
npm run dev -- wp list --wp-path /var/www/html
npm run dev -- wp add ./my-post.md --wp-path /var/www/html --status publish
npm run dev -- wp add ./my-post.md --wp-path /var/www/html --dry-run

# WordPress publishing (REST API — IONOS, GoDaddy, any host)
npm run dev -- wp list --transport rest --wp-url https://example.com --wp-user admin --wp-pass "xxxx xxxx xxxx xxxx"
npm run dev -- wp add ./my-post.md --transport rest --wp-url https://example.com --wp-user admin --wp-pass "xxxx xxxx xxxx xxxx"
npm run dev -- wp scan ./content --transport rest --wp-url https://example.com --wp-user admin --wp-pass "xxxx xxxx xxxx xxxx" --publish

# Or use env vars for WordPress credentials
export WP_URL=https://example.com
export WP_USER=admin
export WP_PASS="xxxx xxxx xxxx xxxx"
npm run dev -- wp list --transport rest
npm run dev -- wp add ./my-post.md --transport rest --status draft
```

---

## Repository layout

```
innotekseo-cli/
├── src/
│   ├── index.ts                     # CLI entry point — registers all commands
│   ├── commands/
│   │   ├── scan.ts                  # `innotekseo scan`
│   │   ├── init.ts                  # `innotekseo init`
│   │   ├── articles.ts              # `innotekseo articles list|add`
│   │   ├── blog.ts                  # `innotekseo blog list|add`
│   │   └── wp.ts                    # `innotekseo wp list|add|scan`
│   ├── lib/
│   │   ├── md-scanner.ts            # walkDir, scanDirectory, toEntries
│   │   ├── llms-builder.ts          # buildLlmsTxt — formats llms.txt string
│   │   ├── frontmatter-validator.ts # validateFrontmatter — shared schema check
│   │   ├── site-locator.ts          # resolveSiteDir — finds innotekseoai.com repo
│   │   ├── scaffolder.ts            # scaffold — copies/renders templates for `init`
│   │   ├── wp-transport.ts          # WpTransport interface, WP-CLI + REST impls
│   │   └── md-to-html.ts            # markdownToHtml — uses `marked` for WP content
│   └── templates/                   # Excluded from tsc; copied verbatim to dist/templates/
│       ├── package.json.tpl
│       ├── next.config.ts.tpl
│       ├── tsconfig.json.tpl
│       ├── articles-lib.ts.tpl
│       ├── globals.css.tpl
│       └── example-article.md
├── tests/
│   ├── md-scanner.test.ts           # 12 tests
│   ├── llms-builder.test.ts         # 4 tests
│   ├── frontmatter-validator.test.ts # 6 tests
│   ├── site-locator.test.ts         # 6 tests
│   ├── wp-transport.test.ts         # 9 tests
│   └── md-to-html.test.ts           # 8 tests
├── dist/                            # Build output (gitignored)
├── package.json
├── tsconfig.json                    # target: ES2021, module: commonjs
├── vitest.config.ts
└── .gitignore
```

---

## Architecture

### Entry point — `src/index.ts`

Registers four command objects onto a `commander` `Program` and calls `program.parse(process.argv)`:

```ts
program.addCommand(scanCommand);
program.addCommand(initCommand);
program.addCommand(articlesCommand);
program.addCommand(blogCommand);
program.addCommand(wpCommand);
```

No business logic here — pure wiring.

---

### Command: `scan` (`src/commands/scan.ts`)

**Purpose:** Walk a local directory of `.md`/`.mdx` files, parse YAML frontmatter, and emit an `llms.txt` file (or stdout with `--dry-run`).

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --output <path>` | `./llms.txt` | Output file path |
| `-u, --url <url>` | `https://example.com` | Base URL — used to construct entry URLs and the header hostname |
| `-r, --recursive` | `false` | Recurse into subdirectories |
| `--dry-run` | `false` | Print to stdout, do not write file |

**Data flow:**

```
path.resolve(directory)
  → scanDirectory(absDir, recursive)   [md-scanner.ts]  → ScannedFile[]
  → toEntries(files, url)              [md-scanner.ts]  → LlmsEntry[]
  → buildLlmsTxt(url, entries)         [llms-builder.ts] → string
  → fs.writeFileSync(outPath) | stdout
```

**Error handling:** exits with code 1 if directory not found or no files found (warn, not exit).

---

### Command: `init` (`src/commands/init.ts`)

**Purpose:** Scaffold a standalone Next.js article site. Calls `scaffold()` from `scaffolder.ts`.

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--skip-install` | `false` | Skip running `npm install` after scaffolding |

**Guard:** refuses to scaffold into a non-empty directory.

---

### Command group: `articles` (`src/commands/articles.ts`)

Parent command `articles` has two subcommands registered via `.command()`.

#### `articles list`

- Resolves site dir via `resolveSiteDir(options.siteDir)`
- Reads all `.md`/`.mdx` from `<siteDir>/content/articles/`
- Parses frontmatter with `gray-matter`
- Prints fixed-width table: Title (40), Category (22), Date (12), Slug

#### `articles add <file>`

Validation chain (exits on failure):
1. File exists
2. Extension is `.md` or `.mdx`
3. `validateFrontmatter()` passes (required: `title`, `date`)
4. Site dir resolves
5. Slug (= filename without extension) not already present in `<siteDir>/content/articles/`

Then either:
- `--dry-run`: prints `[dry-run] Would copy <src> → <dest>`
- normal: `fs.copyFileSync(absFile, destFile)` — always writes as `.mdx`

---

### Command group: `blog` (`src/commands/blog.ts`)

#### `blog list`

- Reads `<siteDir>/lib/config/blog-posts.json` (JSON array)
- Prints fixed-width table: Title (40), Slug (30), Date (12), Category

#### `blog add <file>`

Validation chain:
1. File exists, extension `.md`/`.mdx`
2. `validateFrontmatter()` passes
3. Site dir resolves
4. Slug (from `data.slug` frontmatter field, else filename) not already in JSON

Constructs `BlogPost` object:

```ts
interface BlogPost {
  title: string;
  slug: string;
  date: string;
  author?: string;       // only included if present in frontmatter
  category?: string;
  tags?: string[];       // only if Array.isArray(data.tags)
  excerpt?: string;
  content: string;       // markdown body (gray-matter remainder), trimmed
}
```

Appends to array, re-sorts by `date` descending, writes back with `JSON.stringify(updated, null, 2) + '\n'` (preserves 2-space indent + trailing newline).

---

### Command group: `wp` (`src/commands/wp.ts`)

**Purpose:** Publish markdown content to WordPress sites via WP-CLI or REST API. Works with any WordPress host (self-hosted, IONOS, GoDaddy, WP Engine, etc.).

**Shared options (all subcommands):**

| Flag | Default | Description |
|------|---------|-------------|
| `-t, --transport <type>` | `wp-cli` | Transport: `wp-cli` or `rest` |
| `--wp-url <url>` | `$WP_URL` | WordPress site URL (required for REST) |
| `--wp-user <user>` | `$WP_USER` | WordPress username (required for REST) |
| `--wp-pass <pass>` | `$WP_PASS` | Application password (required for REST) |
| `--wp-path <path>` | `$WP_PATH` | Local WP install path (wp-cli only) |
| `--wp-ssh <host>` | `$WP_SSH` | SSH host for remote wp-cli |

All options fall back to environment variables when flags are omitted.

#### `wp list`

Fetches posts from WordPress and displays a table.

| Flag | Default | Description |
|------|---------|-------------|
| `--post-type <type>` | `post` | Post type (post, page, etc.) |
| `--status <status>` | `any` | Status filter |
| `--per-page <n>` | `50` | Number of posts to fetch |

#### `wp add <file>`

Validates frontmatter, converts markdown to HTML via `marked`, maps fields to WordPress post data, and publishes.

| Flag | Default | Description |
|------|---------|-------------|
| `--post-type <type>` | `post` | Post type |
| `--status <status>` | `draft` | Post status (draft, publish, pending) |
| `--dry-run` | `false` | Preview without publishing |

**Data flow:**
```
path.resolve(file)
  → matter(raw)                         [gray-matter]      → { data, content }
  → validateFrontmatter(data)           [frontmatter-validator.ts]
  → markdownToHtml(content)             [md-to-html.ts]    → HTML string
  → frontmatterToWpPost(data, slug, html) [wp-transport.ts] → WpPost
  → transport.create(wpPost)            [wp-transport.ts]   → published post
```

**Frontmatter → WordPress field mapping:**

| Frontmatter | WordPress | Notes |
|---|---|---|
| `title` | `post_title` | Required |
| `date` | `post_date` | Required |
| `slug` / filename | `post_name` | slug from frontmatter, else filename |
| `excerpt` | `post_excerpt` | Optional |
| `author` | `post_author` | Optional |
| `category` | `post_category` | Resolved to term ID (REST) |
| `tags` (array) | `tags_input` | Resolved to term IDs (REST) |
| `emoji` | `meta.emoji` | Custom field |
| `readTime` | `meta.readTime` | Custom field |

#### `wp scan <directory>`

Generates `llms.txt` (same as `scan` command) and optionally publishes all files to WordPress with `--publish`.

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --output <path>` | `./llms.txt` | Output file path |
| `-u, --url <url>` | `https://example.com` | Base URL for llms.txt |
| `-r, --recursive` | `false` | Recurse into subdirectories |
| `--publish` | `false` | Also publish each file to WordPress |
| `--post-type <type>` | `post` | Post type when publishing |
| `--status <status>` | `draft` | Post status when publishing |
| `--dry-run` | `false` | Preview without writing or publishing |

---

### Transport layer (`src/lib/wp-transport.ts`)

Defines `WpTransport` interface with two implementations:

**`WpCliTransport`** — Shells out to `wp` binary. Supports `--path` for local installs and `--ssh` for remote hosts. Best for servers with shell access.

**`WpRestTransport`** — Uses `fetch` against the WordPress REST API (`/wp-json/wp/v2/`). Authenticates via Basic Auth with application passwords. Works with any host (IONOS, GoDaddy, shared hosting, etc.). Automatically resolves category/tag names to term IDs, creating terms if needed.

**`frontmatterToWpPost()`** — Maps parsed frontmatter to the `WpPost` interface. Custom fields (`emoji`, `readTime`) go into `meta`.

### Markdown-to-HTML (`src/lib/md-to-html.ts`)

**`markdownToHtml(md): string`** — Converts markdown body (post gray-matter extraction) to HTML using `marked`. WordPress stores HTML, so this step is required before publishing.

---

## Library modules

### `src/lib/md-scanner.ts`

**`walkDir(dir, recursive): string[]`** — internal; returns absolute paths of all `.md`/`.mdx` files.

**`scanDirectory(dir, recursive?, rootDir?): ScannedFile[]`**

- `rootDir` enables path sandboxing: if `resolvedDir` does not start with `resolvedRoot`, throws `Error('Directory traversal detected...')`.
- When `rootDir` is omitted, `resolvedRoot = path.resolve(dir)` (no-op guard).
- For each file: reads raw, parses via `gray-matter`, extracts slug from filename, strips markdown syntax from body to build plain-text excerpt (160 chars), falls back to `data.excerpt` if present.

```ts
interface ScannedFile {
  filePath: string;
  slug: string;
  frontmatter: Record<string, unknown>;
  excerpt: string;
}
```

**`toEntries(files, baseUrl, pathPrefix?): LlmsEntry[]`**

- `pathPrefix` defaults to `'articles'`. Leading/trailing slashes stripped.
- URL format: `${cleanBase}/${cleanPrefix}/${slug}`
- Title falls back to slug if `frontmatter.title` is missing.

---

### `src/lib/llms-builder.ts`

**`buildLlmsTxt(siteUrl, entries): string`**

Outputs:
```
# <hostname> – GEO Content Directory

> Machine-readable factual directory for AI assistants and answer engines.
> Generated by innotekseo CLI — https://innotekseoai.com

- [Title](url): summary
...

```

Extracts hostname via `new URL(siteUrl).hostname`. Lines joined with `\n`.

---

### `src/lib/frontmatter-validator.ts`

**`validateFrontmatter(data): ValidationResult`**

```ts
interface ValidationResult {
  valid: boolean;
  errors: string[];    // presence → exits with code 1
  warnings: string[];  // printed but does not block
}
```

| Field | Level |
|-------|-------|
| `title` | Required (error) |
| `date` | Required (error) |
| `excerpt` | Recommended (warning) |
| `category` | Recommended (warning) |
| `emoji` | Recommended (warning) |
| `readTime` | Recommended (warning) |

Checks both absence and empty string (`String(val).trim() === ''`).

---

### `src/lib/site-locator.ts`

**`resolveSiteDir(explicitPath?): string`**

Resolution priority:
1. `explicitPath` argument (from `--site-dir` flag) — must exist and pass `isValidSiteDir()`
2. `process.env.INNOTEKSEO_SITE_DIR` — must pass `isValidSiteDir()`
3. Auto-detect sibling candidates (resolved relative to `process.cwd()`):
   - `../innotekseoai/innotek-agenticseo-console`
   - `../../innotekseoai/innotek-agenticseo-console`
4. Throws with full instructions if nothing found.

**`isValidSiteDir(dir): boolean`** — checks dir exists AND contains both:
- `content/articles/`
- `lib/config/blog-posts.json`

On this machine the sibling `D:/repos/innotekseoai/innotek-agenticseo-console` exists and is auto-detected when `--site-dir` is omitted.

---

### `src/lib/scaffolder.ts`

**`scaffold({ outputDir, skipInstall })`**

Copies/renders template files into `outputDir`:

| Template | Destination |
|----------|-------------|
| `package.json.tpl` | `package.json` (rendered with `writeTemplate`) |
| `next.config.ts.tpl` | `next.config.ts` (copied verbatim) |
| `tsconfig.json.tpl` | `tsconfig.json` (copied verbatim) |
| `globals.css.tpl` | `src/app/globals.css` (rendered) |
| `articles-lib.ts.tpl` | `src/lib/articles.ts` (copied verbatim) |
| `example-article.md` | `content/articles/getting-started.mdx` (copied verbatim) |

`writeTemplate` does `content.replaceAll('{{KEY}}', value)` for each entry in `replacements`. Currently no replacements are passed to `package.json.tpl` or `globals.css.tpl` so `{{KEY}}` syntax is reserved for future use.

Templates directory path at runtime: `path.join(__dirname, '..', 'templates')` — works because `dist/templates/` is populated by the `copy-templates` build step. In dev (`tsx`), `__dirname` is `src/` so `src/templates/` is used directly.

Optionally runs `execSync('npm install', { cwd: d, stdio: 'inherit' })` after scaffolding unless `--skip-install`.

---

## Build pipeline

```
tsc                         → compiles src/**/*.ts → dist/**/*.js (+ .d.ts, .map)
copy-templates (node -e)    → copies src/templates/ → dist/templates/ recursively
```

- `tsconfig.json` excludes `src/templates/` from compilation — template files are not TypeScript.
- Target: **ES2021**, module: **CommonJS** (required for `String.replaceAll` in `scaffolder.ts`).
- `bin.innotekseo` in `package.json` points to `dist/index.js`.
- `prepublishOnly` runs `build` automatically before `npm publish`.

---

## Testing — Vitest

Config (`vitest.config.ts`): `globals: true`, `environment: 'node'`.

45 tests across 6 files, all pass:

| File | Count | What it covers |
|------|-------|----------------|
| `tests/md-scanner.test.ts` | 12 | `walkDir` file filtering, frontmatter parsing, excerpt fallback, recursion, traversal guard, `toEntries` URL construction and pathPrefix |
| `tests/llms-builder.test.ts` | 4 | Header format, zero entries, N entries line format, entry count |
| `tests/frontmatter-validator.test.ts` | 6 | Valid pass, missing title error, missing date error, missing excerpt warns only, all 4 warnings emitted, both required missing |
| `tests/site-locator.test.ts` | 6 | Explicit valid path, non-existent path throws, invalid path throws, env var resolves, invalid env var throws, no-site-found throws (auto-skips if sibling exists locally) |
| `tests/wp-transport.test.ts` | 9 | `frontmatterToWpPost` field mapping: basic fields, title/date fallbacks, tags array, meta fields, author inclusion/omission |
| `tests/md-to-html.test.ts` | 8 | Heading, paragraph, bold/italic, links, lists, code blocks, trimming, empty input |

Tests use `os.tmpdir()` + `fs.mkdtempSync` for temp fixtures; `beforeAll`/`afterAll` clean up with `fs.rmSync(..., { recursive: true, force: true })`.

The "no site dir found" test in `site-locator.test.ts` detects whether the real sibling directory exists at runtime and skips itself — this prevents false failure in the dev environment where the sibling repo is present.

---

## Target site — innotekseoai.com

Sibling repo path (on this machine): `D:/repos/innotekseoai/innotek-agenticseo-console`

| Content type | Location in site repo | Format |
|---|---|---|
| Articles | `content/articles/*.mdx` | MDX with YAML frontmatter |
| Blog posts | `lib/config/blog-posts.json` | JSON array, date-sorted desc |

**Article frontmatter schema** (used by `article-loader.ts` in site repo):
```yaml
title: string
category: string
emoji: string
date: YYYY-MM-DD
excerpt: string
readTime: "N min read"
```

**blog-posts.json entry schema:**
```json
{
  "title": "string",
  "slug": "string",
  "date": "YYYY-MM-DD",
  "author": "string",
  "category": "string",
  "tags": ["string"],
  "excerpt": "string",
  "content": "markdown string"
}
```

---

## GitHub

Repository: `https://github.com/innotekseoai/innotekseo-cli.git`
Default branch: `master`

`.gitignore` excludes: `node_modules/`, `dist/`, `*.js.map`, `*.d.ts.map`, `.env`, `.env.*`, `.claude/`, `.mcp.json`

---

## Dependencies

### Runtime
| Package | Purpose |
|---------|---------|
| `commander ^12` | CLI argument parsing, subcommand groups |
| `gray-matter ^4` | YAML frontmatter parsing from `.md`/`.mdx` |
| `marked ^15` | Markdown-to-HTML conversion for WordPress publishing |

### Dev
| Package | Purpose |
|---------|---------|
| `typescript ^5` | TypeScript compiler |
| `tsx ^4` | Run TypeScript directly (dev script) |
| `@types/node ^20` | Node.js type definitions |
| `vitest ^2` | Test runner |
| `@vitest/coverage-v8 ^2` | Coverage reporting (v8 provider) |

---

## Conventions

- All errors print `\x1b[31mError:\x1b[0m <message>` then `process.exit(1)`.
- All warnings print `\x1b[33mWarning:\x1b[0m <message>` and continue.
- Success prints `\x1b[32m✓\x1b[0m <message>`.
- Spinner/progress prints `\x1b[36m⟳\x1b[0m <message>`.
- `--dry-run` is supported on all write-path commands (`scan`, `articles add`, `blog add`). It always prints what would happen without touching the filesystem.
- Slug is always derived from the **filename** (without extension) except in `blog add` where `frontmatter.slug` takes priority.
- Article files are always written with `.mdx` extension regardless of source extension.
- `blog-posts.json` is always written with `JSON.stringify(array, null, 2) + '\n'` (2-space indent, trailing newline).
