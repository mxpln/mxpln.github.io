#!/usr/bin/env node
// Single-page static generator: reads .md bookmark files, outputs index.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import Handlebars from 'handlebars';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');

Handlebars.registerHelper('padded', (n, w) => String(n + 1).padStart(w, '0'));
Handlebars.registerHelper('lowercase', s => (s || '').toLowerCase());
Handlebars.registerHelper('concat', (...a) => a.slice(0, -1).join(''));
Handlebars.registerHelper('join', (arr, sep) => (arr || []).join(sep));

function readMd(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { body: raw, data: {} };
  const data = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else if (/^-?\d+$/.test(v)) v = Number(v);
    else v = v.replace(/^"|"$/g, '');
    data[k] = v;
  }
  return { body: m[2].trim(), data };
}

function parseDir(dir) {
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ slug: f.replace(/\.md$/, ''), ...readMd(join(dir, f)) }))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0) || a.slug.localeCompare(b.slug));
}

const sections = parseDir(join(src, 'content', 'sections'));
const links = parseDir(join(src, 'content', 'links'));

const gardenSections = sections.map(sec => ({
  id: sec.slug,
  file: sec.data.file,
  links: links
    .filter(l => l.data.section === sec.slug)
    .map(l => ({ ...l.data, slug: l.slug }))
}));

const starred = links.filter(l => l.data.starred).map(l => ({ ...l.data, slug: l.slug }));
const total = links.length;

const tmpl = Handlebars.compile(readFileSync(join(src, 'template.hbs'), 'utf8'));

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.html'), tmpl({ gardenSections, starred, total }));
writeFileSync(join(dist, 'style.css'), readFileSync(join(src, 'style.css')));
writeFileSync(join(dist, '.nojekyll'), '');

console.log(`Built 1 page — ${total} links, ${sections.length} sections -> dist/`);
