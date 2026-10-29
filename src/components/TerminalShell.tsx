import React from 'react';
import { TerminalSquare, X } from 'lucide-react';

export interface CommandOutcome {
  output: string[];
  action?: () => void;
}

interface Line {
  kind: 'input' | 'output';
  text: string;
}

interface TerminalShellProps {
  prompt: string;
  title: string;
  hint?: string;
  heightClass?: string;
  initialLines?: string[];
  onCommand: (raw: string) => CommandOutcome;
  onClose?: () => void;
}

export const TerminalShell: React.FC<TerminalShellProps> = ({
  prompt,
  title,
  hint,
  heightClass = 'h-56',
  initialLines = [],
  onCommand,
  onClose
}) => {
  const [lines, setLines] = React.useState<Line[]>(
    initialLines.map((text) => ({ kind: 'output' as const, text }))
  );
  const [input, setInput] = React.useState('');
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = (raw: string) => {
    const outcome = onCommand(raw);
    setLines((prev) => {
      let next = [...prev, { kind: 'input' as const, text: `${prompt} ${raw}` }];
      for (const line of outcome.output) {
        if (line === '__CLEAR__') {
          next = [];
          continue;
        }
        next = [...next, { kind: 'output', text: line }];
      }
      return next;
    });
    outcome.action?.();
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
    <div className="gdn font-mono text-[13px] cursor-text" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--gdn-border)] bg-[var(--gdn-panel)] gdn-dim text-xs">
        <TerminalSquare size={13} className="text-[var(--gdn-accent)]" />
        <span>{title}</span>
        {hint && <span className="hidden sm:inline opacity-60">{hint}</span>}
        {onClose && (
          <button onClick={onClose} className="ml-auto hover:text-[var(--gdn-text)]" aria-label="close terminal">
            <X size={14} />
          </button>
        )}
      </div>
      <div ref={scrollRef} className={`${heightClass} overflow-y-auto p-3 bg-[var(--gdn-bg)]`}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={line.kind === 'input' ? 'text-[var(--gdn-text)] mt-1' : 'gdn-dim whitespace-pre-wrap'}
          >
            {line.text}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[var(--gdn-accent)] shrink-0">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent outline-none text-[var(--gdn-text)] caret-[var(--gdn-accent)] min-w-0"
            spellCheck={false}
            autoComplete="off"
            aria-label="terminal input"
          />
        </div>
      </div>
    </div>
  );
};
