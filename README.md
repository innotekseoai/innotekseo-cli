# @innotekseo/cli

> Free CLI for AI-first SEO — generate `llms.txt` from markdown files and scaffold GEO-optimised article and blog sites.

Part of the **[Innotek Platform Toolkits](https://innotekseoai.com/platform-toolkits)** — open-source tools for AI-era content discoverability.

**GitHub:** [innotekseoai/innotekseo-cli](https://github.com/innotekseoai/innotekseo-cli)

```bash
npx @innotekseo/cli scan ./content/articles --url https://yourdomain.com
npx @innotekseo/cli init ./my-article-site
```

## Installation

```bash
npm install -g @innotekseo/cli
```

Or use without installing:

```bash
npx @innotekseo/cli <command>
```

The binary name is `innotekseo` — after global install, run as:

```bash
innotekseo scan ./content --url https://yourdomain.com
```

## Commands

### `innotekseo scan <directory>`

Scans a directory of `.md` and `.mdx` files and generates an `llms.txt` file — a machine-readable index that tells AI assistants and answer engines what your site contains.

```bash
# Basic usage
innotekseo scan ./content/articles --url https://yourdomain.com

# Output to custom path
innotekseo scan ./docs --url https://yourdomain.com --output ./public/llms.txt

# Preview without writing
innotekseo scan ./content --url https://yourdomain.com --dry-run

# Scan subdirectories
innotekseo scan ./content --url https://yourdomain.com --recursive
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output <path>` | `./llms.txt` | Output file path |
| `-u, --url <url>` | `https://example.com` | Base URL of your site |
| `-r, --recursive` | `false` | Scan subdirectories |
| `--dry-run` | `false` | Print to stdout, don't write file |

---

### `innotekseo init <output-dir>`

Scaffolds a new article site with auto-generated nav from `.mdx` files.

```bash
innotekseo init ./my-article-site
cd ./my-article-site
npm run dev
```

Drop any `.mdx` file into `content/articles/` — it automatically appears in the nav and article list.

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--skip-install` | `false` | Skip npm install |

---

### `innotekseo articles list`

List all articles in an innotekseoai site.

```bash
innotekseo articles list --site-dir ./path/to/site
```

### `innotekseo articles add <file>`

Add a `.md` or `.mdx` article file to the site's `content/articles/` directory.

```bash
# Dry run — preview without writing
innotekseo articles add ./my-article.mdx --site-dir ./path/to/site --dry-run

# Copy the file
innotekseo articles add ./my-article.mdx --site-dir ./path/to/site
```

---

### `innotekseo blog list`

List all blog posts from `lib/config/blog-posts.json`.

```bash
innotekseo blog list --site-dir ./path/to/site
```

### `innotekseo blog add <file>`

Parse a markdown file with YAML frontmatter and append it to `blog-posts.json` (sorted by date desc).

```bash
innotekseo blog add ./my-post.md --site-dir ./path/to/site --dry-run
innotekseo blog add ./my-post.md --site-dir ./path/to/site
```

---

### Site directory resolution

The `--site-dir` option resolves in priority order:

1. Explicit `--site-dir <path>` CLI flag
2. `INNOTEKSEO_SITE_DIR` environment variable
3. Auto-detect sibling directory: `../innotekseoai/innotek-agenticseo-console`

```bash
export INNOTEKSEO_SITE_DIR=/path/to/site
innotekseo articles list
innotekseo blog list
```

---

## Frontmatter Format

Articles and blog posts use YAML frontmatter:

```yaml
---
title: "The Fact Density Playbook"
category: "GEO Optimisation"
emoji: "📊"
date: "2025-02-10"
excerpt: "AI models cite content with verifiable facts 3.7× more often..."
readTime: "12 min read"
---

## Your content here...
```

## How llms.txt Works

The `llms.txt` standard is a machine-readable file that tells AI models what your site is about:

```
# yourdomain.com – GEO Content Directory

> Machine-readable factual directory for AI assistants and answer engines.

- [The Fact Density Playbook](https://yourdomain.com/articles/fact-density-playbook): AI models cite content...
- [Entity Clarity Guide](https://yourdomain.com/articles/entity-clarity-guide): How to score and improve...
```

## Related Packages

Part of the `@innotekseo` toolkit:

| Package | Description |
|---|---|
| [`@innotekseo/blogs-core`](https://www.npmjs.com/package/@innotekseo/blogs-core) | Content adapter library + REST API for Astro blog systems |
| [`@innotekseo/blogs-components`](https://www.npmjs.com/package/@innotekseo/blogs-components) | Astro UI components for MDX content |
| [`@innotekseo/blogs-migrate`](https://www.npmjs.com/package/@innotekseo/blogs-migrate) | HTML-to-MDX migration CLI |

→ **[Innotek Platform Toolkits](https://innotekseoai.com/platform-toolkits)** — full suite of open-source SEO and content tools.

## Enterprise

The CLI handles single-site, manual workflows. For production AI compliance at scale:

| Feature | CLI (Free) | Innotek Enterprise |
|---------|-----------|-------------------|
| llms.txt generation | Manual | Automated |
| GEO audit scoring | — | 8 AI readiness metrics |
| Schema.org generation | — | Per-page JSON-LD |
| AI citation tracking | — | ChatGPT, Perplexity, Claude |
| Multi-page crawl | — | Up to 50 pages |
| Brand visibility monitoring | — | Weekly AI scans |

→ **[Innotek Enterprise](https://innotekseoai.com/pricing)** — automated AI discoverability for your entire site.

## License

MIT — Innotek Solutions Ltd
