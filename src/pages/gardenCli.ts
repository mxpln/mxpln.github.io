import { GardenSection, GardenLink } from './gardenData';

export interface CliResult {
  output: string[];
  sections?: GardenSection[];
  openUrl?: string;
}

const HELP = [
  'available commands:',
  '  help                     show this help',
  '  ls [section]             list sections, or links in a section',
  '  grep <query>             search links by title, url, description or tag',
  '  open <n|url>             open link n from the last listing (new tab)',
  '  add <section> <url> <title...> [#tag ...]   save a new link',
  '  star <n|url>             toggle star on a link',
  '  rm <n|url>               remove a link',
  '  reset                    restore the default seed links',
  '  clear                    clear the terminal'
];

function findLink(
  sections: GardenSection[],
  ref: string
): { section: GardenSection; link: GardenLink; index: number } | null {
  if (/^\d+$/.test(ref)) {
    let n = parseInt(ref, 10);
    for (const section of sections) {
      for (let i = 0; i < section.links.length; i++) {
        if (n === 1) return { section, link: section.links[i], index: i };
        n--;
      }
    }
    return null;
  }
  for (const section of sections) {
    const index = section.links.findIndex(
      (l) => l.url === ref || l.url.replace(/\/$/, '') === ref.replace(/\/$/, '')
    );
    if (index !== -1) return { section, link: section.links[index], index };
  }
  return null;
}

function listLinks(sections: GardenSection[]): string[] {
  const lines: string[] = [];
  let n = 1;
  for (const s of sections) {
    lines.push(`${s.file}  (${s.links.length})`);
    for (const l of s.links) {
      const star = l.starred ? '*' : ' ';
      lines.push(`  ${String(n).padStart(2)} ${star} ${l.title}  —  ${l.url}`);
      n++;
    }
  }
  return lines;
}

export function executeCommand(rawInput: string, sections: GardenSection[]): CliResult {
  const input = rawInput.trim();
  if (!input) return { output: [] };
  const [cmd, ...args] = input.split(/\s+/);
  const query = args.join(' ');

  switch (cmd.toLowerCase()) {
    case 'help':
      return { output: HELP };

    case 'clear':
      return { output: ['__CLEAR__'] };

    case 'ls': {
      if (!args[0]) {
        return {
          output: [
            ...sections.map((s) => `${s.file}  ${s.title} — ${s.links.length} links`),
            '',
            ...listLinks(sections)
          ]
        };
      }
      const section = sections.find(
        (s) => s.id === args[0] || s.file === args[0] || s.title.toLowerCase() === args[0].toLowerCase()
      );
      if (!section) return { output: [`ls: no such section: ${args[0]}  (try: ls)`] };
      const lines = [`${section.file}  (${section.links.length})`];
      let n = sections.slice(0, sections.indexOf(section)).reduce((a, s) => a + s.links.length, 0) + 1;
      for (const l of section.links) {
        const star = l.starred ? '*' : ' ';
        lines.push(`  ${String(n).padStart(2)} ${star} ${l.title}  —  ${l.url}`);
        n++;
      }
      return { output: lines };
    }

    case 'grep': {
      if (!query) return { output: ['usage: grep <query>'] };
      const q = query.toLowerCase();
      const lines: string[] = [`grep -i "${query}"`];
      let n = 1;
      let count = 0;
      for (const s of sections) {
        for (const l of s.links) {
          const hay = `${l.title} ${l.url} ${l.description} ${l.tags.join(' ')}`.toLowerCase();
          if (hay.includes(q)) {
            const star = l.starred ? '*' : ' ';
            lines.push(`  ${String(n).padStart(2)} ${star} ${l.title}  —  ${l.url}  [${s.file}]`);
            count++;
          }
          n++;
        }
      }
      lines.push(`${count} match${count === 1 ? '' : 'es'}`);
      return { output: lines };
    }

    case 'open': {
      if (!args[0]) return { output: ['usage: open <n|url>'] };
      const found = findLink(sections, args[0]);
      if (!found) return { output: [`open: no link matching "${args[0]}"`] };
      return { output: [`opening ${found.link.url} ↗`], openUrl: found.link.url };
    }

    case 'add': {
      const sectionId = args[0];
      const url = args[1];
      if (!sectionId || !url || !/^https?:\/\//i.test(url)) {
        return { output: ['usage: add <section> <https://url> <title...> [#tag ...]'] };
      }
      const section = sections.find(
        (s) => s.id === sectionId || s.file === sectionId || s.title.toLowerCase() === sectionId.toLowerCase()
      );
      if (!section) {
        return { output: [`add: no such section "${sectionId}". sections: ${sections.map((s) => s.id).join(', ')}`] };
      }
      const rest = args.slice(2);
      const tags = rest.filter((a) => a.startsWith('#')).map((a) => a.slice(1).toLowerCase());
      const title = rest.filter((a) => !a.startsWith('#')).join(' ').trim();
      if (!title) return { output: ['add: missing link title'] };
      if (section.links.some((l) => l.url === url)) {
        return { output: [`add: ${url} is already saved in ${section.file}`] };
      }
      const link: GardenLink = { title, url, description: '', tags };
      const newSections = sections.map((s) =>
        s.id === section.id ? { ...s, links: [...s.links, link] } : s
      );
      return {
        output: [`saved #${section.links.length + 1} → ${section.file}: ${title} (${url})`],
        sections: newSections
      };
    }

    case 'star': {
      if (!args[0]) return { output: ['usage: star <n|url>'] };
      const found = findLink(sections, args[0]);
      if (!found) return { output: [`star: no link matching "${args[0]}"`] };
      const newSections = sections.map((s) =>
        s.id === found.section.id
          ? { ...s, links: s.links.map((l, i) => (i === found.index ? { ...l, starred: !l.starred } : l)) }
          : s
      );
      return {
        output: [`${found.link.starred ? 'unstarred' : 'starred'} ${found.link.title}`],
        sections: newSections
      };
    }

    case 'rm': {
      if (!args[0]) return { output: ['usage: rm <n|url>'] };
      const found = findLink(sections, args[0]);
      if (!found) return { output: [`rm: no link matching "${args[0]}"`] };
      const newSections = sections.map((s) =>
        s.id === found.section.id ? { ...s, links: s.links.filter((_, i) => i !== found.index) } : s
      );
      return { output: [`removed ${found.link.title} from ${found.section.file}`], sections: newSections };
    }

    case 'reset':
      return { output: ['__RESET__'] };

    default:
      return { output: [`${cmd}: command not found — type "help"`] };
  }
}
