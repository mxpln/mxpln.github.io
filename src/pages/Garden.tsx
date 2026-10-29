import React from 'react';
import { Link as LinkIcon, Search, Star, FolderOpen, TerminalSquare } from 'lucide-react';
import { GardenSection, GardenLink } from './gardenData';
import { GardenTerminal } from '../components/GardenTerminal';
import { loadSections, subscribe } from './gardenStore';

const LinkCard: React.FC<{ link: GardenLink }> = ({ link }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="garden-card block p-5 group"
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
        <LinkIcon size={16} className="shrink-0 text-[var(--accent)]" />
        {link.title}
      </h3>
      {link.starred && (
        <Star size={16} className="shrink-0 fill-[var(--accent)] text-[var(--accent)]" />
      )}
    </div>
    <p className="text-sm text-[var(--text-secondary)] mb-3">{link.description}</p>
    <div className="flex gap-2 flex-wrap items-center">
      {link.tags.map((tag) => (
        <span key={tag} className="brutal-tech px-2 py-0.5 text-xs">
          {tag}
        </span>
      ))}
      <span className="ml-auto text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
        open ↗
      </span>
    </div>
  </a>
);

export const Garden: React.FC = () => {
  const [sections, setSections] = React.useState<GardenSection[]>(loadSections);
  const [query, setQuery] = React.useState('');
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [starredOnly, setStarredOnly] = React.useState(false);
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
  const matches = (link: GardenLink) => {
    if (starredOnly && !link.starred) return false;
    if (activeTag && !link.tags.includes(activeTag)) return false;
    if (!q) return true;
    return (
      link.title.toLowerCase().includes(q) ||
      link.description.toLowerCase().includes(q) ||
      link.url.toLowerCase().includes(q) ||
      link.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  const visibleSections = sections
    .map((s) => ({ ...s, links: s.links.filter(matches) }))
    .filter((s) => s.links.length > 0);

  const total = sections.reduce((n, s) => n + s.links.length, 0);
  const visibleCount = visibleSections.reduce((n, s) => n + s.links.length, 0);

  const tags = Array.from(new Set(sections.flatMap((s) => s.links.flatMap((l) => l.tags)))).sort();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="brutal-container p-8 mb-10">
        <h1 className="brutal-title text-5xl md:text-7xl mb-4 flex items-center gap-4">
          <TerminalSquare size={48} className="text-[var(--accent)] hidden md:block" />
          GARDEN/
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-6">
          My personal collection of links — bookmarks, tools and reading, saved in one place.
        </p>

        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep the garden...  (Ctrl+K)"
            className="brutal-input pl-11 font-mono text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs border border-[var(--border)] px-1.5 py-0.5 text-[var(--text-secondary)]">
            Ctrl K
          </kbd>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={() => setStarredOnly((v) => !v)}
            className={`brutal-tech px-3 py-1 text-sm flex items-center gap-1.5 ${starredOnly ? '!bg-[var(--accent)] !text-white' : ''}`}
          >
            <Star size={13} className={starredOnly ? 'fill-white' : ''} />
            starred
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`brutal-tech px-3 py-1 text-sm ${activeTag === tag ? '!bg-[var(--accent)] !text-white' : ''}`}
            >
              #{tag}
            </button>
          ))}
          {(query || activeTag || starredOnly) && (
            <button
              onClick={() => { setQuery(''); setActiveTag(null); setStarredOnly(false); }}
              className="text-sm underline text-[var(--text-secondary)] ml-1"
            >
              clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-[var(--text-secondary)] font-mono">
            {visibleCount}/{total} links
          </span>
        </div>
      </header>

      <div className="mb-10">
        <GardenTerminal sections={sections} onSectionsChange={setSections} />
      </div>

      {visibleSections.length === 0 && (
        <div className="brutal-container p-8 text-center text-[var(--text-secondary)] font-mono">
          $ no results for "{query}" — try another grep
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {visibleSections.map((section) => (
          <section key={section.id} className="brutal-container p-6">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="brutal-title text-2xl flex items-center gap-2">
                <FolderOpen size={20} className="text-[var(--accent)]" />
                {section.title}
              </h2>
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                {section.file} · {section.links.length}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5">{section.description}</p>
            <div className="grid gap-4">
              {section.links.map((link) => (
                <LinkCard key={link.url} link={link} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
