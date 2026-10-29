import React from 'react';
import { TerminalSquare } from 'lucide-react';
import { GardenSection } from '../pages/gardenData';
import { executeCommand } from '../pages/gardenCli';
import { saveSections, resetSections } from '../pages/gardenStore';

interface Line {
  kind: 'input' | 'output';
  text: string;
}

interface GardenTerminalProps {
  sections: GardenSection[];
  onSectionsChange: (sections: GardenSection[]) => void;
}

const PROMPT = 'garden:~$';

export const GardenTerminal: React.FC<GardenTerminalProps> = ({ sections, onSectionsChange }) => {
  const [lines, setLines] = React.useState<Line[]>([
    { kind: 'output', text: 'garden-os v1.0 — type "help" for commands' }
  ]);
  const [input, setInput] = React.useState('');
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const result = executeCommand(raw, sections);
    setLines((prev) => {
      let next = [...prev, { kind: 'input' as const, text: `${PROMPT} ${raw}` }];
      for (const line of result.output) {
        if (line === '__CLEAR__') {
          next = [];
          continue;
        }
        if (line === '__RESET__') {
          resetSections();
          onSectionsChange(sections);
          next = [...next, { kind: 'output', text: 'restored default seed links' }];
          continue;
        }
        next = [...next, { kind: 'output', text: line }];
      }
      return next;
    });
    if (result.sections) {
      saveSections(result.sections);
      onSectionsChange(result.sections);
    }
    if (result.openUrl) {
      window.open(result.openUrl, '_blank', 'noopener,noreferrer');
    }
    if (raw.trim()) {
      setHistory((h) => [...h, raw]);
      setHistoryIndex(-1);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = historyIndex + 1;
      if (idx >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="brutal-container p-0 overflow-hidden cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-[var(--border)] bg-[var(--surface-alt)]">
        <TerminalSquare size={14} className="text-[var(--accent)]" />
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          garden-os — type <span className="text-[var(--accent)]">help</span>
        </span>
      </div>
      <div
        ref={scrollRef}
        className="font-mono text-sm p-4 h-72 overflow-y-auto bg-[var(--surface)]"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={line.kind === 'input' ? 'text-[var(--text)] mt-1' : 'text-[var(--text-secondary)] whitespace-pre-wrap'}
          >
            {line.text}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1 font-mono text-sm">
          <span className="text-[var(--accent)] shrink-0">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent outline-none text-[var(--text)] caret-[var(--accent)]"
            spellCheck={false}
            autoComplete="off"
            aria-label="garden terminal input"
          />
        </div>
      </div>
    </div>
  );
};
