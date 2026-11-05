#!/usr/bin/env node
// Scaffold a new markdown content file and optionally push to GitHub.
//
// Usage:
//   node scripts/new-content.mjs link my-slug --title "My Link" --url "https://..." \
//        --section dev-tools --tags "git,tools" [--starred] [--push] [--body "text"]
//   node scripts/new-content.mjs section my-section --title "MY_SECTION" [--push]
//
// Missing required fields are prompted for interactively.
// --push runs: git add -A && git commit -m "..." && git push origin main

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(root, 'src', 'content');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (key === 'starred' || key === 'push') {
        args[key] = true;
      } else {
        args[key] = argv[++i];
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function nextOrder(dir) {
  const orders = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const m = readFileSync(path.join(dir, f), 'utf8').match(/^order:\s*(\d+)/m);
      return m ? Number(m[1]) : 0;
    });
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function listSections() {
  const dir = path.join(CONTENT, 'sections');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const type = args._[0];
  if (type !== 'link' && type !== 'section') {
    console.error('Usage: node scripts/new-content.mjs <link|section> [slug] [options]');
    process.exit(1);
  }

  const dir = path.join(CONTENT, type === 'link' ? 'links' : 'sections');
  let slug = args._[1] || slugify((args.title || '').trim());
  if (!slug) slug = slugify(await ask('Slug (filename): '));
  if (!slug) { console.error('A slug is required.'); process.exit(1); }
  const file = path.join(dir, `${slug}.md`);
  if (existsSync(file)) { console.error(`Already exists: ${file}`); process.exit(1); }

  let frontmatter = '';
  let defaultBody = '';

  if (type === 'link') {
    const title = args.title || (await ask('Title: '));
    const url = args.url || (await ask('URL: '));
    if (!/^https?:\/\//.test(url)) { console.error('URL must start with http:// or https://'); process.exit(1); }
    const sections = listSections();
    let section = args.section;
    if (!section) {
      console.log('Sections: ' + sections.join(', '));
      section = await ask('Section: ');
    }
    if (!sections.includes(section)) { console.error(`Unknown section "${section}". Pick one of: ${sections.join(', ')}`); process.exit(1); }
    const tags = (args.tags ? args.tags.split(',') : (await ask('Tags (comma-separated, blank for none): ')).split(',')).map((t) => t.trim()).filter(Boolean);
    const description = args.description || (await ask('Description (one line): '));
    const starred = args.starred ? 'true' : 'false';
    const order = nextOrder(dir);
    frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `url: ${JSON.stringify(url)}`,
      `description: ${JSON.stringify(description)}`,
      `tags: [${tags.join(', ')}]`,
      `starred: ${starred}`,
      `section: ${section}`,
      `order: ${order}`,
      '---',
    ].join('\n');
    defaultBody = args.body || `${title} — ${description}`;
  } else {
    const title = args.title || (await ask('Title (e.g. MY_SECTION): '));
    const description = args.description || (await ask('Description (one line): '));
    const order = nextOrder(dir);
    frontmatter = [
      '---',
      `title: ${title}`,
      `file: ${slug}.md`,
      `order: ${order}`,
      `description: ${JSON.stringify(description)}`,
      '---',
    ].join('\n');
    defaultBody = args.body || description;
  }

  const body = args.body ?? defaultBody;
  writeFileSync(file, `${frontmatter}\n\n${body}\n`);
  console.log(`Created ${path.relative(root, file)}`);
  rl.close();

  if (args.push) {
    const msg = args.m || `Add ${type} "${slug}"`;
    execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
    execFileSync('git', ['commit', '-m', msg], { cwd: root, stdio: 'inherit' });
    execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });
    console.log('Pushed to origin/main — Pages deploy will trigger automatically.');
  } else {
    console.log('Run `pnpm publish` (or git add/commit/push) when ready to deploy.');
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
