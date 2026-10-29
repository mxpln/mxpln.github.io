import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalShell, CommandOutcome } from '../components/TerminalShell';

const PAGES = [
  { file: 'garden/', path: '/garden', desc: 'personal link collection — grep, add, star' },
  { file: 'works/', path: '/works', desc: 'projects' },
  { file: 'lab/', path: '/lab', desc: 'experiments' },
  { file: 'stack/', path: '/stack', desc: 'tech stack' },
  { file: 'manifesto.md', path: '/manifesto', desc: 'philosophy' },
  { file: 'contact.sh', path: '/contact', desc: 'get in touch' }
];

const PROFILE = [
  'mxpln@github:~$ neofetch --profile',
  '',
  '        ██████████████        mxpln',
  '     ████████████████████     ─────────',
  '   ████████████████████████   OS: browser',
  '  ██████████████████████████  Shell: react · ts',
  '  ██████████████████████████  Host: github pages',
  '  ██████████████████████████  Uptime: since 2025',
  '  ██████████████████████████  Theme: terminal-dark',
  '   ████████████████████████',
  '     ██████████████████       ▌garden/ — save your links',
  '        ██████████            ▌works/  — projects',
  '                            ▌contact.sh — say hi',
  ''
];

const HELP = [
  'available commands:',
  '  help              show this help',
  '  ls                list pages',
  '  cd <page>         open a page (garden, works, lab, stack, manifesto, contact)',
  '  open <n>          open page n from the listing',
  '  grep <query>      search pages',
  '  clear             clear the terminal'
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const visible = PAGES.filter(
    (p) => !q || p.file.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );

  const handleCommand = (raw: string): CommandOutcome => {
    const input = raw.trim();
    if (!input) return { output: [] };
    const [cmd, ...args] = input.split(/\s+/);
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        return { output: HELP };
      case 'clear':
        return { output: ['__CLEAR__'] };
      case 'ls':
        return {
          output: [
            ...PAGES.map((p, i) => `${String(i + 1).padStart(2, ' ')}  ${p.file.padEnd(16)} ${p.desc}`),
            '',
            'cd <page> or open <n> to navigate'
          ]
        };
      case 'cd':
      case 'open': {
        const target = cmd === 'cd' ? arg : /^\d+$/.test(arg) ? PAGES[parseInt(arg, 10) - 1]?.file : arg;
        const page = PAGES.find((p) => p.file.replace(/\/$/, '') === target?.replace(/\/$/, ''));
        if (!page) return { output: [`${cmd}: no such page: ${arg || '(none)'} — try: ls`] };
        return {
          output: [`opening ${page.file} ↗`],
          action: () => navigate(page.path)
        };
      }
      case 'grep': {
        if (!arg) return { output: ['usage: grep <query>'] };
        const g = arg.toLowerCase();
        const hits = PAGES.filter((p) => p.file.includes(g) || p.desc.toLowerCase().includes(g));
        return {
          output: [
            ...hits.map((p, i) => `${String(i + 1).padStart(2, ' ')}  ${p.file.padEnd(16)} ${p.desc}`),
            `${hits.length} match${hits.length === 1 ? '' : 'es'}`
          ]
        };
      }
      default:
        return { output: [`${cmd}: command not found — type "help"`] };
    }
  };

  return (
    <div className="gdn min-h-screen font-mono text-[13px] flex flex-col">
      {/* top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--gdn-border)] gdn-dim text-xs shrink-0">
        <span className="text-[var(--gdn-accent)]">~/</span>
        <span className="text-[var(--gdn-text)]">mxpln.github.io</span>
        <span className="opacity-50">~ ☀</span>
        <span className="ml-auto">❯_ terminal</span>
      </div>

      <main className="flex-1 px-3 md:px-6 py-4 max-w-3xl w-full mx-auto">
        {/* neofetch-style profile */}
        <pre className="text-[11px] md:text-xs leading-tight mb-6 overflow-x-auto text-[var(--gdn-text)]">
          {PROFILE.join('\n')}
        </pre>

        {/* grep line */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-4 border border-[var(--gdn-border)] bg-[var(--gdn-panel)] focus-within:border-[var(--gdn-accent)] transition-colors">
          <span className="gdn-dim">$</span>
          <span className="text-[var(--gdn-accent)]">grep</span>
          <span className="gdn-dim">-i</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="pages"
            className="flex-1 bg-transparent outline-none text-[var(--gdn-text)] placeholder:gdn-dim min-w-0"
            spellCheck={false}
          />
          <kbd className="gdn-kbd">Ctrl K</kbd>
        </div>

        {/* file listing */}
        <div className="mb-4">
          <div className="gdn-dim text-xs px-2 pb-1">~/ — {visible.length} files</div>
          {visible.length === 0 && <div className="gdn-dim px-2 py-2">$ no results for "{query}"</div>}
          {visible.map((p, i) => (
            <button
              key={p.path}
              onClick={() => navigate(p.path)}
              className="gdn-row w-full text-left flex items-baseline gap-3 px-2 py-[3px]"
            >
              <span className="gdn-dim text-xs w-6 shrink-0 text-right">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-bold text-[var(--gdn-accent)] w-24 shrink-0 truncate">{p.file}</span>
              <span className="gdn-dim text-xs truncate">{p.desc}</span>
              <span className="ml-auto gdn-dim text-xs shrink-0">↗</span>
            </button>
          ))}
        </div>

        <p className="gdn-dim text-xs px-2 mt-4">
          Ctrl K search · type <span className="text-[var(--gdn-accent)]">help</span> in the terminal below · cd garden
        </p>
      </main>

      {/* inline terminal */}
      <div className="shrink-0 border-t border-[var(--gdn-border)]">
        <TerminalShell
          prompt="mxpln.github.io:~$"
          title="❯_ TERMINAL — mxpln-os"
          hint="type help, ls or what you need"
          heightClass="h-56"
          initialLines={['mxpln-os — type "help", "ls" or what you need']}
          onCommand={handleCommand}
        />
      </div>

      {/* status bar */}
      <div className="flex items-center gap-4 px-3 py-1 text-[11px] gdn-dim border-t border-[var(--gdn-border)] bg-[var(--gdn-panel)] shrink-0">
        <span className="text-[var(--gdn-accent)]">⎇ main</span>
        <span>✓ 0 problems</span>
        <span className="hidden sm:inline">mxpln.profile</span>
        <span className="ml-auto hidden md:inline">© 2026 mxpln.github.io</span>
        <span>Ln 1, Col 1</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">HTML</span>
      </div>
    </div>
  );
};
