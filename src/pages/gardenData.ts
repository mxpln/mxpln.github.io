export interface GardenLink {
  title: string;
  url: string;
  description: string;
  tags: string[];
  starred?: boolean;
}

export interface GardenSection {
  id: string;
  title: string;
  file: string;
  description: string;
  links: GardenLink[];
}

export const gardenSections: GardenSection[] = [
  {
    id: 'dev',
    title: 'DEV_TOOLS',
    file: 'dev-tools.md',
    description: 'Resources for building and shipping software',
    links: [
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: 'The reference for web platform APIs and standards.',
        tags: ['docs', 'reference'],
        starred: true
      },
      {
        title: 'GitHub',
        url: 'https://github.com',
        description: 'Code hosting, issues and pull requests.',
        tags: ['git', 'hosting'],
        starred: true
      },
      {
        title: 'Can I use',
        url: 'https://caniuse.com',
        description: 'Browser support tables for HTML, CSS and JS APIs.',
        tags: ['compatibility', 'reference']
      },
      {
        title: 'Regex101',
        url: 'https://regex101.com',
        description: 'Build, test and debug regular expressions with explanations.',
        tags: ['regex', 'tool']
      }
    ]
  },
  {
    id: 'design',
    title: 'DESIGN',
    file: 'design.md',
    description: 'Inspiration and references for interfaces and visuals',
    links: [
      {
        title: 'Coolors',
        url: 'https://coolors.co',
        description: 'Fast colour palette generator.',
        tags: ['color', 'tool']
      },
      {
        title: 'Fontshare',
        url: 'https://www.fontshare.com',
        description: 'Free high-quality fonts from the Indian Type Foundry.',
        tags: ['typography', 'fonts']
      }
    ]
  },
  {
    id: 'reading',
    title: 'READING_LIST',
    file: 'reading.md',
    description: 'Articles and essays worth revisiting',
    links: [
      {
        title: 'A List Apart',
        url: 'https://alistapart.com',
        description: 'Web design and development articles since 1998.',
        tags: ['articles', 'web'],
        starred: true
      },
      {
        title: 'Hacker News',
        url: 'https://news.ycombinator.com',
        description: 'Tech news and discussion aggregator.',
        tags: ['news', 'community']
      }
    ]
  },
  {
    id: 'music',
    title: 'MUSIC',
    file: 'music.md',
    description: 'Playlists, artists and tools for sound',
    links: [
      {
        title: 'Radio Garden',
        url: 'https://radio.garden',
        description: 'Listen to radio stations from all over the world on a globe.',
        tags: ['radio', 'discovery']
      },
      {
        title: 'Every Noise at Once',
        url: 'https://everynoise.com',
        description: 'A map of virtually every music genre.',
        tags: ['music', 'discovery']
      }
    ]
  }
];

export const allTags: string[] = Array.from(
  new Set(gardenSections.flatMap((s) => s.links.flatMap((l) => l.tags)))
).sort();
