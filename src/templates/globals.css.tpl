:root {
  --bg: #06080f;
  --surface: #0d1117;
  --surface2: #111722;
  --border: rgba(255,255,255,0.07);
  --accent: #00e5ff;
  --accent2: #7b5cf6;
  --accent3: #00ff9d;
  --text: #e8edf5;
  --muted: #6b7a99;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  overflow-x: hidden;
  margin: 0;
}

a { color: var(--accent); text-decoration: none; }
a:hover { opacity: 0.8; }

nav.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(6,8,15,0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-wrap: wrap;
  gap: 1rem;
}

.site-logo { font-weight: 700; font-size: 1.1rem; color: var(--text); }
.site-logo span { color: var(--accent); margin-right: 0.3rem; }

nav.site-header ul { display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
nav.site-header a { color: var(--muted); font-size: 0.85rem; }
nav.site-header a:hover, nav.site-header a.active { color: var(--text); }

.hero { text-align: center; padding: 5rem 2rem 3rem; max-width: 800px; margin: 0 auto; }
.hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
.hero p { color: var(--muted); font-size: 1.1rem; }

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.article-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.article-card:hover { border-color: var(--accent); opacity: 1; }
.article-card-emoji { font-size: 1.5rem; }
.article-card-category { font-size: 0.7rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; }
.article-card-title { font-weight: 700; font-size: 1rem; color: var(--text); }
.article-card-excerpt { color: var(--muted); font-size: 0.85rem; line-height: 1.6; flex: 1; }
.article-card-meta { font-size: 0.75rem; color: var(--muted); display: flex; gap: 0.75rem; margin-top: 0.5rem; }

.article-body { max-width: 760px; margin: 0 auto; padding: 2rem; }
.article-hero { text-align: center; padding: 4rem 2rem 2rem; }
.article-hero h1 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
.article-hero p { color: var(--muted); font-size: 1rem; max-width: 640px; margin: 0 auto 1rem; }
.article-meta { display: flex; gap: 1rem; justify-content: center; color: var(--muted); font-size: 0.8rem; }

.article-body h2 { font-size: 1.4rem; font-weight: 700; margin: 2.5rem 0 1rem; color: var(--text); }
.article-body h3 { font-size: 1.1rem; font-weight: 600; margin: 2rem 0 0.75rem; }
.article-body p { color: var(--muted); line-height: 1.85; margin-bottom: 1.25rem; }
.article-body ul, .article-body ol { color: var(--muted); padding-left: 1.5rem; line-height: 1.8; margin-bottom: 1.25rem; }
.article-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
.article-body th { padding: 0.75rem 1rem; text-align: left; border-bottom: 2px solid var(--border); font-weight: 600; color: var(--text); }
.article-body td { padding: 0.65rem 1rem; border-bottom: 1px solid var(--border); color: var(--muted); }
.article-body code { font-family: monospace; font-size: 0.85em; background: var(--surface2); padding: 0.1em 0.4em; border-radius: 4px; }
.article-body pre { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem 1.5rem; overflow-x: auto; margin: 1.5rem 0; }
.article-body pre code { background: none; padding: 0; }
.article-body strong { color: var(--text); }

.cta-bar {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 760px;
}

.cta-bar h2 { font-size: 1.5rem; margin-bottom: 0.75rem; }
.cta-bar p { color: var(--muted); margin-bottom: 1.5rem; }
.btn-primary {
  display: inline-block;
  background: var(--accent3);
  color: #06080f;
  font-weight: 700;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
}
.btn-primary:hover { opacity: 0.9; color: #06080f; }

.site-footer {
  border-top: 1px solid var(--border);
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.85rem;
  margin-top: 4rem;
}

.stat-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; }
.stat-card-value { font-size: 2rem; font-weight: 800; color: var(--accent3); line-height: 1; }
.stat-card-label { font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem; }
.stat-card-sub { font-size: 0.65rem; color: var(--muted); opacity: 0.6; margin-top: 0.1rem; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin: 1.5rem 0; }
.card-item { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
.card-item-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
.card-item-title { font-weight: 700; margin-bottom: 0.5rem; color: var(--text); }
.card-item-body { color: var(--muted); font-size: 0.875rem; line-height: 1.65; }

.comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin: 1.5rem 0; }
.comparison-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
.comparison-panel.good { border-color: rgba(0,255,157,0.3); }
.comparison-panel-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1rem; }
.comparison-panel-items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; margin: 0; }
.comparison-panel-items li { color: var(--muted); font-size: 0.875rem; display: flex; gap: 0.5rem; align-items: flex-start; }
.comparison-panel-items li.bad .icon { color: #ef4444; flex-shrink: 0; }
.comparison-panel-items li.good .icon { color: var(--accent3); flex-shrink: 0; }

.checklist { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; margin: 1.5rem 0; }
.checklist li { display: flex; gap: 0.75rem; align-items: flex-start; color: var(--muted); font-size: 0.9rem; line-height: 1.6; }
.checklist .check { color: var(--accent3); flex-shrink: 0; font-weight: 700; }
