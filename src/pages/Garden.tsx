import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { GardenSection, GardenLink } from './gardenData';
import { GardenTerminal } from '../components/GardenTerminal';
import { loadSections, subscribe } from './gardenStore';

const LinkRow: React.FC<{ link: GardenLink; index: number; sectionFile: string }> = ({ link, index, sectionFile }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="gdn-row group flex items-start gap-3 px-3 py-2.5 border-b border-[var(--gdn-border)] last:border-b-0"
  >
    <span className="gdn-dim font-mono text-xs pt-0.5 w-7 shrink-0">{String(index).padStart(2, '0')}</span>
    <span className="flex-1 min-w-0">
      <span className="block font-bold truncate group-hover:text-[var(--gdn-accent)] transition-colors">
        {link.title}
      </span>
      {link.description && (
        <span className="block text-sm gdn-dim truncate">{link.description}</span>
      )}
    </span>
    <span className="hidden md:flex gap-1.5 shrink-0 pt-0.5">
      {link.tags.map((tag) => (
        <span key={tag} className="gdn-tag">{tag}</span>
      ))}
    </span>
    {link.starred && <Star size={13} className="shrink-0 pt-1 fill-[var(--gdn-accent)] text-[var(--gdn-accent)]" />}
    <span className="shrink-0 pt-0.5 gdn-dim opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
    <span className="sr-only">in {sectionFile}</span>
  </a>
);

export const Garden: React.FC = () => {
  const [sections, setSections] = React.useState<GardenSection[]>(loadSections);
  const [query, setQuery] = React.useState('');
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [starredOnly, setStarredOnly] = React.useState(false);
  const [terminalOpen, setTerminalOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => subscribe(setSections), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
      if (e.key === 'Escape' && terminalOpen) setTerminalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [terminalOpen]);

  const q = query.trim().toLowerCase();
  const matches = (link: GardenLink) => {
    if (starredOnly && !link.starred) return false;
    if (!q) return true;
    return (
      link.title.toLowerCase().includes(q) ||
      link.description.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q) ||
      link.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  const starred = sections.flatMap((s) => s.links.filter((l) => l.starred).map((l) => ({ ...l, sectionFile: s.file })));
  const visibleSections = sections
    .map((s) => ({ ...s, links: s.links.filter(matches) }))
    .filter((s) => s.links.length > 0 && (!activeSection || s.id === activeSection));

  const total = sections.reduce((n, s) => n + s.links.length, 0);
  const visibleCount = sections.reduce((n, s) => n + s.links.filter(matches).length, 0);

  let globalIndex = 0;
  const nextIndex = () => ++globalIndex;

  return (
    <div className="gdn min-h-screen font-mono text-sm">
      {/* top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--gdn-border)] gdn-dim text-xs">
        <span className="text-[var(--gdn-accent)]">~/</span>
        <span className="text-[var(--gdn-text)]">mxpln.github.io</span>
        <span className="opacity-50">— personal garden</span>
        <button
          onClick={() => setTerminalOpen((v) => !v)}
          className="ml-auto gdn-tag hover:text-[var(--gdn-accent)] cursor-pointer"
          title="toggle terminal (Ctrl+`)"
        >
          ❯_ terminal {terminalOpen ? '▴' : '▾'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* sidebar file tree */}
        <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[var(--gdn-border)] p-3 text-[13px]">
          <div className="gdn-dim text-xs mb-2 px-1">garden/</div>
          <button
            onClick={() => { setActiveSection(null); setStarredOnly(false); }}
            className={`gdn-tree ${!activeSection && !starredOnly ? 'gdn-tree-active' : ''}`}
          >
            <ChevronRight size={12} className="shrink-0" /> all-links
          </button>
          <button
            onClick={() => { setStarredOnly(true); setActiveSection(null); }}
            className={`gdn-tree ${starredOnly ? 'gdn-tree-active' : ''}`}
          >
            <Star size={12} className="shrink-0 fill-current" /> starred
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setStarredOnly(false); }}
              className={`gdn-tree ${activeSection === s.id ? 'gdn-tree-active' : ''}`}
            >
              <span className="shrink-0 gdn-dim">{s.links.length}</span> {s.file}
            </button>
          ))}
        </aside>

        {/* main column */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 max-w-4xl">
          {/* breadcrumb */}
          <div className="gdn-dim text-xs mb-4">
            mxpln.github.io <span className="mx-1">›</span> {starredOnly ? 'starred' : activeSection ? sections.find((s) => s.id === activeSection)?.file : 'garden'}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[var(--gdn-text)]">
            {starredOnly ? '★ starred' : activeSection ? sections.find((s) => s.id === activeSection)?.title : 'garden/'}
          </h1>
          <p className="gdn-dim mb-6">
            {starredOnly
              ? 'your most-used links'
              : activeSection
                ? sections.find((s) => s.id === activeSection)?.description
                : 'my personal collection of links — bookmarks, tools and reading'}
          </p>

          {/* grep search */}
          <div className="flex items-center gap-2 border border-[var(--gdn-border)] bg-[var(--gdn-panel)] px-3 py-2 mb-6 focus-within:border-[var(--gdn-accent)] transition-colors">
            <span className="gdn-dim">$</span>
            <span className="text-[var(--gdn-accent)]">grep</span>
            <span className="gdn-dim">-i</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search all links..."
              className="flex-1 bg-transparent outline-none text-[var(--gdn-text)] placeholder:gdn-dim"
              spellCheck={false}
            />
            <kbd className="gdn-kbd">Ctrl K</kbd>
          </div>

          {/* starred section */}
          {starredOnly && (
            <section className="border border-[var(--gdn-border)] mb-8">
              <div className="px-3 py-2 border-b border-[var(--gdn-border)] gdn-dim text-xs flex justify-between">
                <span>★ most used</span>
                <span>{starred.length} links</span>
              </div>
              {starred.length === 0 && <div className="px-3 py-4 gdn-dim">$ nothing starred yet — use `star &lt;n&gt;` in the terminal</div>}
              {starred.map((l) => (
                <LinkRow key={l.url} link={l} index={nextIndex()} sectionFile={l.sectionFile} />
              ))}
            </section>
          )}

          {/* sections */}
          {!starredOnly && visibleSections.length === 0 && (
            <div className="border border-[var(--gdn-border)] px-3 py-6 gdn-dim text-center">
              $ no results{q ? ` for "${query}"` : ''} — try another grep
            </div>
          )}
          {!starredOnly && visibleSections.map((section) => (
            <section key={section.id} className="border border-[var(--gdn-border)] mb-8">
              <div className="px-3 py-2 border-b border-[var(--gdn-border)] flex items-center justify-between">
                <span className="text-[var(--gdn-text)] font-bold">{section.file}</span>
                <span className="gdn-dim text-xs">{section.links.length} files · {section.description}</span>
              </div>
              {section.links.map((link) => (
                <LinkRow key={link.url} link={link} index={nextIndex()} sectionFile={section.file} />
              ))}
            </section>
          ))}

          {!starredOnly && (
            <p className="gdn-dim text-xs mt-4">
              → browse all links · <span className="text-[var(--gdn-accent)]">Ctrl K</span> searches every link · or type in the terminal (Ctrl `)
            </p>
          )}
        </main>
      </div>

      {/* bottom terminal drawer */}
      {terminalOpen && (
        <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[var(--gdn-accent)] bg-[var(--gdn-bg)] z-40">
          <GardenTerminal sections={sections} onSectionsChange={setSections} compact />
        </div>
      )}

      {/* status bar */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center gap-4 px-3 py-1 text-[11px] gdn-dim border-t border-[var(--gdn-border)] bg-[var(--gdn-panel)] z-30" style={{ paddingBottom: terminalOpen ? '19rem' : undefined }}>
        <span className="text-[var(--gdn-accent)]">⎇ main</span>
        <span>✓ 0 problems</span>
        <span className="hidden sm:inline">garden.links</span>
        <span className="ml-auto hidden md:inline">© 2026 mxpln.github.io</span>
        <span>Ln {visibleCount}, Col {total}</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">links/</span>
      </div>
    </div>
  );
};
