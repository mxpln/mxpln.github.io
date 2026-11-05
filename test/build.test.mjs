import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const linksDir = join(root, 'src', 'content', 'links');

const build = () => execFileSync('node', ['generate.mjs'], { cwd: root });
const linkFiles = () => readdirSync(linksDir).filter((f) => f.endsWith('.md'));
const titles = () =>
  linkFiles().map((f) => {
    const m = readFileSync(join(linksDir, f), 'utf8').match(/^title:\s*(.+)$/m);
    return m[1].trim().replace(/^"|"$/g, '');
  });

test('build emits index.html, style.css and .nojekyll', () => {
  build();
  assert.ok(existsSync(join(dist, 'index.html')));
  assert.ok(existsSync(join(dist, 'style.css')));
  assert.ok(existsSync(join(dist, '.nojekyll')));
});

test('every link title from src/content/links appears in the output', () => {
  build();
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  for (const t of titles()) assert.ok(html.includes(t), `missing title: ${t}`);
});

test('output uses relative URLs only (works on file:// and subpaths)', () => {
  build();
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.equal((html.match(/href="\//g) || []).length, 0, 'found absolute href');
  assert.equal((html.match(/src="\//g) || []).length, 0, 'found absolute src');
});

test('row count matches link count plus starred duplicates', () => {
  build();
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const rows = (html.match(/<div class="row" data-gdn-row/g) || []).length;
  const starred = linkFiles().filter((f) =>
    /^starred:\s*true/m.test(readFileSync(join(linksDir, f), 'utf8'))
  ).length;
  assert.equal(rows, linkFiles().length + starred);
});

test('two consecutive builds are byte-identical (deterministic)', () => {
  build();
  const first = readFileSync(join(dist, 'index.html'), 'utf8');
  build();
  const second = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.equal(first, second);
});
