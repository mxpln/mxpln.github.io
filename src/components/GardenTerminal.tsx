import React from 'react';
import { GardenSection } from '../pages/gardenData';
import { executeCommand } from '../pages/gardenCli';
import { saveSections, resetSections, loadSections } from '../pages/gardenStore';
import { TerminalShell, CommandOutcome } from './TerminalShell';

interface GardenTerminalProps {
  sections: GardenSection[];
  onSectionsChange: (sections: GardenSection[]) => void;
  compact?: boolean;
}

export const GardenTerminal: React.FC<GardenTerminalProps> = ({ sections, onSectionsChange, compact = false }) => {
  const handleCommand = (raw: string): CommandOutcome => {
    const result = executeCommand(raw, sections);
    const isReset = result.output.includes('__RESET__');
    return {
      output: result.output.map((line) => (line === '__RESET__' ? 'restored default seed links' : line)),
      action: () => {
        if (isReset) {
          resetSections();
          onSectionsChange(loadSections());
        } else if (result.sections) {
          saveSections(result.sections);
          onSectionsChange(result.sections);
        }
        if (result.openUrl) window.open(result.openUrl, '_blank', 'noopener,noreferrer');
      }
    };
  };

  return (
    <TerminalShell
      prompt="mxpln.github.io:~$"
      title="❯_ TERMINAL — garden-os"
      hint='type help, ls or what you need · Ctrl+` toggles'
      heightClass={compact ? 'h-56' : 'h-72'}
      initialLines={['garden-os — type "help", "ls" or what you need · Ctrl+` toggles']}
      onCommand={handleCommand}
    />
  );
};
