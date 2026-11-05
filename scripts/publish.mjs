#!/usr/bin/env node
// Commit all changes and push to origin/main (triggers the Pages deploy).
// Usage: node scripts/publish.mjs "commit message"   (prompts if omitted)

import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let msg = process.argv.slice(2).join(' ').trim();
if (!msg) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  msg = await new Promise((res) => rl.question('Commit message: ', res));
  rl.close();
}
if (!msg) { console.error('A commit message is required.'); process.exit(1); }

execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['commit', '-m', msg], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });
console.log('Pushed to origin/main — Pages deploy triggered.');
