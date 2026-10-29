import { gardenSections, GardenSection } from './gardenData';

const STORAGE_KEY = 'garden-links-v1';

type Listener = (sections: GardenSection[]) => void;
const listeners = new Set<Listener>();

export function loadSections(): GardenSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as GardenSection[];
    }
  } catch {
    // fall through to defaults
  }
  return gardenSections;
}

export function saveSections(sections: GardenSection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  listeners.forEach((l) => l(sections));
}

export function resetSections(): void {
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l(gardenSections));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
