# innotek-seo CLI

> Free CLI tool for AI-first SEO — generate `llms.txt` from markdown files and scaffold GEO-optimised article sites.

```bash
npx innotek-seo scan ./content/articles --url https://yourdomain.com
npx innotek-seo init ./my-article-site
```

## Installation

```bash
npm install -g innotek-seo
```

Or use without installing:
```bash
npx innotek-seo <command>
```

## Commands

### `innotek-seo scan <directory>`

Scans a directory of `.md` and `.mdx` files and generates an `llms.txt` file.

```bash
# Basic usage
innotek-seo scan ./content/articles --url https://yourdomain.com

# Output to custom path
innotek-seo scan ./docs --url https://yourdomain.com --output ./public/llms.txt

# Preview without writing
innotek-seo scan ./content --url https://yourdomain.com --dry-run

# Scan subdirectories
innotek-seo scan ./content --url https://yourdomain.com --recursive
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output <path>` | `./llms.txt` | Output file path |
| `-u, --url <url>` | `https://example.com` | Base URL of your site |
| `-r, --recursive` | `false` | Scan subdirectories |
| `--dry-run` | `false` | Print to stdout, don't write file |

### `innotek-seo init <output-dir>`

Scaffolds a new Next.js article site with auto-generated nav from `.mdx` files.

```bash
innotek-seo init ./my-blog
cd ./my-blog
npm run dev
```

Then drop any `.mdx` file into `content/articles/` — it automatically appears in the nav and article list.

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--skip-install` | `false` | Skip npm install |

## Frontmatter Format

Articles use YAML frontmatter:

```yaml
---
title: "The Fact Density Playbook"
category: "GEO Optimisation"
emoji: "📊"
date: "2025-02-10"
excerpt: "AI models cite content with verifiable facts 3.7× more often..."
readTime: "12 min read"
---

## Your article content here...
```

## How llms.txt Works

The `llms.txt` standard is a machine-readable file that tells AI models what your site is about:

```
# yourdomain.com – GEO Content Directory

> Machine-readable factual directory for AI assistants and answer engines.

- [The Fact Density Playbook](https://yourdomain.com/articles/fact-density-playbook): AI models cite content...
- [Entity Clarity Guide](https://yourdomain.com/articles/entity-clarity-guide): How to score and improve...
```

## Enterprise: Automated Multi-Page AI Compliance

The CLI handles single-site, manual workflows. For production AI compliance at scale:

| Feature | CLI (Free) | Innotek Enterprise |
|---------|-----------|-------------------|
| llms.txt generation | ✓ Manual | ✓ Automated |
| GEO audit scoring | ✗ | ✓ 8 AI readiness metrics |
| Schema.org generation | ✗ | ✓ Per-page JSON-LD |
| AI citation tracking | ✗ | ✓ ChatGPT, Perplexity, Claude |
| Multi-page crawl | ✗ | ✓ Up to 50 pages |
| Brand visibility monitoring | ✗ | ✓ Weekly AI scans |

→ **[Innotek Enterprise](https://innotekseoai.com/pricing)** — automated AI discoverability for your entire site.

## License

MIT — Innotek Solutions Ltd
