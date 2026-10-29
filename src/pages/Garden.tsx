import React from 'react';
import { GardenSection, GardenLink } from './gardenData';
import { GardenTerminal } from '../components/GardenTerminal';
import { loadSections, subscribe } from './gardenStore';

const Row: React.FC<{ link: GardenLink; n: number }> = ({ link, n }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="gdn-row group flex items-baseline gap-3 px-2 py-[3px]"
  >
    <span className="gdn-dim text-xs w-6 shrink-0 text-right">{String(n).padStart(2, '0')}</span>
    <span className="shrink-0 w-3 text-[var(--gdn-accent)]">{link.starred ? '★' : ''}</span>
    <span className="font-bold group-hover:text-[var(--gdn-accent)] transition-colors truncate">
      {link.title}
    </span>
    <span className="gdn-dim text-xs truncate hidden sm:inline">{link.description}</span>
    <span className="ml-auto gdn-dim text-xs shrink-0 hidden md:inline">
      {link.tags.map((t) => `#${t}`).join(' ')}
    </span>
    <span className="gdn-dim text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
  </a>
);

export const Garden: React.FC = () => {
  const [sections, setSections] = React.useState<GardenSection[]>(loadSections);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => subscribe(setSections), []);

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
  const matches = (link: GardenLink) =>
    !q ||
    link.title.toLowerCase().includes(q) ||
    link.description.toLowerCase().includes(q) ||
    link.url.toLowerCase().includes(q) ||
    link.tags.some((t) => t.toLowerCase().includes(q));

  const visible = sections
    .map((s) => ({ ...s, links: s.links.filter(matches) }))
    .filter((s) => s.links.length > 0);
  const starred = sections.flatMap((s) => s.links.filter((l) => l.starred && matches(l)));
  const total = sections.reduce((n, s) => n + s.links.length, 0);
  const shown = visible.reduce((n, s) => n + s.links.length, 0);

  let n = 0;
  const next = () => ++n;

  return (
    <div className="gdn min-h-screen font-mono text-[13px] flex flex-col">
      {/* top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--gdn-border)] gdn-dim text-xs shrink-0">
        <span className="text-[var(--gdn-accent)]">~/</span>
        <span className="text-[var(--gdn-text)]">mxpln.github.io</span>
        <span className="opacity-50">~ ☀</span>
        <span className="ml-auto">❯_ terminal</span>
      </div>

      {/* main listing */}
      <main className="flex-1 px-3 md:px-6 py-4 max-w-3xl w-full mx-auto">
        <div className="gdn-dim text-xs mb-3">
          mxpln.github.io <span className="mx-1">›</span> garden/
        </div>

        {/* grep line */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-4 border border-[var(--gdn-border)] bg-[var(--gdn-panel)] focus-within:border-[var(--gdn-accent)] transition-colors">
          <span className="gdn-dim">$</span>
          <span className="text-[var(--gdn-accent)]">grep</span>
          <span className="gdn-dim">-i</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="links"
            className="flex-1 bg-transparent outline-none text-[var(--gdn-text)] placeholder:gdn-dim min-w-0"
            spellCheck={false}
          />
          <kbd className="gdn-kbd">Ctrl K</kbd>
        </div>

        {starred.length > 0 && (
          <div className="mb-4">
            <div className="gdn-dim text-xs px-2 pb-1">★ most used</div>
            {starred.map((l) => (
              <Row key={l.url} link={l} n={next()} />
            ))}
          </div>
        )}

        {visible.length === 0 && (
          <div className="gdn-dim px-2 py-4">$ no results{q ? ` for "${query}"` : ''}</div>
        )}

        {visible.map((section) => (
          <div key={section.id} className="mb-4">
            <div className="gdn-dim text-xs px-2 pb-1">
              {section.file} <span className="opacity-60">— {section.links.length} links</span>
            </div>
            {section.links.map((link) => (
              <Row key={link.url} link={link} n={next()} />
            ))}
          </div>
        ))}

        <p className="gdn-dim text-xs px-2 mt-6">
          {shown}/{total} links · Ctrl K search · Ctrl ` terminal · type <span className="text-[var(--gdn-accent)]">help</span> below
        </p>
      </main>

      {/* inline terminal */}
      <div className="shrink-0 border-t border-[var(--gdn-border)]">
        <GardenTerminal sections={sections} onSectionsChange={setSections} compact />
      </div>

      {/* status bar */}
      <div className="flex items-center gap-4 px-3 py-1 text-[11px] gdn-dim border-t border-[var(--gdn-border)] bg-[var(--gdn-panel)] shrink-0">
        <span className="text-[var(--gdn-accent)]">⎇ main</span>
        <span>✓ 0 problems</span>
        <span className="hidden sm:inline">garden.links</span>
        <span className="ml-auto hidden md:inline">© 2026 mxpln.github.io</span>
        <span>Ln {shown}, Col {total}</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">links/</span>
      </div>
    </div>
  );
};
