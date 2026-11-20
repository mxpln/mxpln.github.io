#!/usr/bin/env node
// content/bookmarks/*.md  →  one self-contained static page (dist/bookmarks.html).
// No dependencies. Needs Node 14+.
//
// Markdown format (one file per category, files are sorted by name):
//   # 🛠️ dev-tools                      ← category title (first "# " line; falls back to the file name)
//   - [Name](https://url) — short note  ← one bookmark per line; the note is optional
//
// Usage: node build-bookmarks.js [--in content/bookmarks] [--out dist/bookmarks.html]
//          [--handle mxpln] [--accent "#a98bff"] [--glow bright|soft|off] [--density comfortable|compact]

const fs = require('fs');
const path = require('path');

// ---------- args ----------
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : 'true';
}
const dir = path.resolve(__dirname, args.in || 'content/bookmarks');
const outFile = path.resolve(__dirname, args.out || 'dist/bookmarks.html');
const handle = args.handle || 'mxpln';
const accent = /^#[0-9a-f]{3,8}$/i.test(args.accent || '') ? args.accent : '#a98bff';
const glow = ['bright', 'soft', 'off'].includes(args.glow) ? args.glow : 'bright';
const rowPad = args.density === 'compact' ? '3px' : '6px';

// ---------- helpers ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// "🛠️ dev-tools" -> "🛠️ Dev tools" (same rule as the design)
const label = s => s.replace(/[-_]+/g, ' ').replace(/(^|\s)([a-z])/, (m, p, c) => p + c.toUpperCase());
const safeUrl = u => (/^(https?:|mailto:|\/|\.\/|#)/i.test(u.trim()) ? u.trim() : null);
const LI = /^[-*]\s+\[([^\]]+)\]\(([^)\s]+)\)\s*(?:[—–-]\s*)?(.*?)\s*$/;

function parse(md, file) {
  const lines = md.replace(/\r/g, '').split('\n');
  const h = lines.map(l => l.match(/^#\s+(.+?)\s*$/)).find(Boolean);
  const items = [];
  lines.forEach((l, n) => {
    if (!/^[-*]\s/.test(l)) return;
    const m = l.match(LI), url = m && safeUrl(m[2]);
    if (!m || !url) { console.warn(`  ! ${file}:${n + 1} ignored (expected "- [Name](https://url) — note")`); return; }
    items.push({ title: m[1], url, desc: m[3] });
  });
  return { name: h ? h[1] : file.replace(/^\d+-/, '').replace(/\.md$/, ''), items };
}

// ---------- read content ----------
if (!fs.existsSync(dir)) { console.error(`Folder not found: ${dir}`); process.exit(1); }
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
if (!files.length) { console.error(`No .md files in ${dir}`); process.exit(1); }
const cats = files.map(f => parse(fs.readFileSync(path.join(dir, f), 'utf8'), f)).filter(c => c.items.length);

// ---------- render ----------
const sections = cats.map(c => `    <section data-cat="${esc(label(c.name))}">
      <h2>${esc(label(c.name))}</h2>
${c.items.map(it => `      <a class="row" href="${esc(it.url)}" target="_blank" rel="noopener" data-title="${esc(it.title)}" data-desc="${esc(it.desc)}"><span class="dash">-</span><span class="txt"><b>${esc(it.title)}</b>${it.desc ? `<span class="desc"> — ${esc(it.desc)}</span>` : ''}</span><span class="arrow">↗</span></a>`).join('\n')}
    </section>`).join('\n');

const textShadow = glow === 'off' ? 'none'
  : glow === 'soft' ? '0 0 6px color-mix(in oklch,var(--accent) 70%,transparent),0 0 18px color-mix(in oklch,var(--accent) 35%,transparent)'
  : '0 0 2px #fff,0 0 6px var(--accent),0 0 14px var(--accent),0 0 32px color-mix(in oklch,var(--accent) 70%,transparent),0 0 64px color-mix(in oklch,var(--accent) 40%,transparent)';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(handle)}@web</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:${accent};--row-pad:${rowPad};--mono:'JetBrains Mono',ui-monospace,Menlo,monospace}
*{box-sizing:border-box}
html,body{margin:0;background:#0b0c0e;color:#e4e4e7}
body{min-height:100vh;padding:clamp(40px,8vw,88px) clamp(20px,5vw,32px) 80px;font:14px/1.7 var(--mono);-webkit-font-smoothing:antialiased}
a{color:#e4e4e7;text-decoration:none}
::selection{background:var(--accent);color:#0b0c0e}
main{max-width:720px;margin:0 auto}
header{margin:0 0 36px}
.logo{position:relative;display:inline-block;margin:0;font-size:clamp(26px,5vw,34px);font-weight:700;letter-spacing:-.01em;line-height:1.1;color:#f5f3ff;text-shadow:${textShadow}}
.logo em{font-style:normal;color:var(--accent)}
.logo .sweep{position:absolute;inset:0;color:transparent;text-shadow:none;pointer-events:none;background-image:linear-gradient(90deg,transparent 40%,rgba(255,255,255,.95) 50%,transparent 60%);background-size:250% 100%;background-repeat:no-repeat;-webkit-background-clip:text;background-clip:text;animation:sweep 5s linear infinite}
@keyframes sweep{from{background-position:100% 0}to{background-position:0% 0}}
@media (prefers-reduced-motion:reduce){.logo .sweep{display:none}}
.search{display:flex;align-items:center;gap:12px;margin:0 0 32px;padding:10px 12px 10px 14px;border:1px solid #1d1f23;border-radius:10px;background:#101114}
.search:focus-within{border-color:color-mix(in oklch,var(--accent) 55%,#1d1f23)}
.search input{flex:1;min-width:0;background:transparent;border:0;outline:none;padding:0;color:#e4e4e7;font:inherit}
.search input::placeholder{color:#5a5d65}
kbd{flex:none;font:11px/1 var(--mono);color:#7d8089;border:1px solid #26282c;border-radius:4px;padding:4px 6px}
section{margin:0 0 28px}
h2{margin:0 0 6px;font-size:13px;font-weight:500;color:var(--accent)}
.row{display:grid;grid-template-columns:1ch minmax(0,1fr) auto;column-gap:10px;align-items:baseline;padding:var(--row-pad) 10px;margin:0 -10px;border-radius:8px}
.row .dash{color:#5a5d65}
.row .txt{min-width:0;text-wrap:pretty}
.row b{font-weight:500;color:#f4f4f5}
.row .desc{color:#8a8d95}
.row .arrow{color:#8a8d95;opacity:0}
.row.on{background:#16171b}
.row.on .arrow{opacity:1}
mark{background:color-mix(in oklch,var(--accent) 32%,transparent);color:#fff;border-radius:2px}
[hidden]{display:none!important}
#empty{color:#8a8d95}
</style>
</head>
<body>
<main>
  <header><h1 class="logo" aria-label="${esc(handle)}@web">${esc(handle)}<em>@web</em><span class="sweep" aria-hidden="true">${esc(handle)}@web</span></h1></header>
  <label class="search">
    <input id="q" type="search" placeholder="Search bookmarks" spellcheck="false" autocomplete="off" aria-label="Search bookmarks">
    <kbd>⌃K</kbd>
  </label>
  <div id="list">
${sections}
  </div>
  <div id="empty" hidden></div>
</main>
<script>
(function () {
  var q = document.getElementById('q'), empty = document.getElementById('empty');
  var sections = [].slice.call(document.querySelectorAll('section'));
  var rows = [].slice.call(document.querySelectorAll('.row'));
  var visible = [], sel = -1;

  function fill(el, text, term) {            // text with <mark> around matches, no innerHTML
    el.textContent = '';
    if (!term) { el.textContent = text; return; }
    var lo = text.toLowerCase(), i = 0, j;
    while ((j = lo.indexOf(term, i)) > -1) {
      if (j > i) el.appendChild(document.createTextNode(text.slice(i, j)));
      var m = document.createElement('mark'); m.textContent = text.slice(j, j + term.length); el.appendChild(m);
      i = j + term.length;
    }
    if (i < text.length) el.appendChild(document.createTextNode(text.slice(i)));
  }
  function select(n) {
    sel = n;
    rows.forEach(function (r) { r.classList.remove('on'); });
    if (visible[n]) { visible[n].classList.add('on'); visible[n].scrollIntoView({ block: 'nearest' }); }
  }
  function apply() {
    var term = q.value.trim().toLowerCase();
    visible = [];
    sections.forEach(function (s) {
      var any = false;
      [].forEach.call(s.querySelectorAll('.row'), function (r) {
        var t = r.dataset.title, d = r.dataset.desc;
        var ok = !term || (t + ' ' + d + ' ' + s.dataset.cat).toLowerCase().indexOf(term) > -1;
        r.hidden = !ok;
        if (ok) { any = true; visible.push(r); }
        fill(r.querySelector('b'), t, term);
        var ds = r.querySelector('.desc');
        if (ds) { ds.textContent = ' — '; var span = document.createElement('span'); ds.appendChild(span); fill(span, d, term); }
      });
      s.hidden = !any;
    });
    empty.hidden = !(term && !visible.length);
    empty.textContent = 'No matches for “' + q.value + '”';
    select(term && visible.length ? 0 : -1);
  }

  q.addEventListener('input', apply);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(Math.min(visible.length - 1, sel + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(Math.max(0, sel - 1)); }
    else if (e.key === 'Enter' && visible[sel]) { e.preventDefault(); window.open(visible[sel].href, '_blank', 'noopener'); }
    else if (e.key === 'Escape') { q.value = ''; apply(); }
  });
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { var n = visible.indexOf(r); if (n > -1) select(n); }); });
  window.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (((e.ctrlKey || e.metaKey) && k === 'k') || (k === '/' && document.activeElement !== q)) { e.preventDefault(); q.focus(); }
  });
})();
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html);
const n = cats.reduce((s, c) => s + c.items.length, 0);
console.log(`✓ ${path.relative(process.cwd(), outFile)} — ${cats.length} categories, ${n} bookmarks, ${(html.length / 1024).toFixed(1)} kB`);
