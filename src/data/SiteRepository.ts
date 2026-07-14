// SiteRepository.ts
//
// Web analogue of the Kotlin SiteRepository. In the Android app this
// persists a `site_history.json` file in `filesDir`; here we keep the exact
// same JSON shape but persist it to `localStorage`. Only *metadata*
// (site name, type, counter, last-used) is ever stored — never a password.

import { PasswordType, PASSWORD_TYPE_TO_INT, INT_TO_PASSWORD_TYPE } from '../crypto/PasswordType';

const STORAGE_KEY = 'phantomkey.site_history.json';

export interface SiteEntry {
  siteName: string;
  lastUsed: number;
  defaultType: string;
  defaultCounter: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function loadRaw(): SiteEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SiteEntry[];
  } catch {
    return [];
  }
}

function saveRaw(entries: SiteEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* noop */
  }
  notify();
}

export const SiteRepository = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSites(): SiteEntry[] {
    return loadRaw().sort((a, b) => b.lastUsed - a.lastUsed);
  },

  recordSite(siteName: string, type: PasswordType, counter: number) {
    const trimmed = siteName.trim();
    if (!trimmed) return;
    const entries = loadRaw();
    const idx = entries.findIndex((e) => e.siteName === trimmed);
    const entry: SiteEntry = {
      siteName: trimmed,
      lastUsed: Date.now(),
      defaultType: type,
      defaultCounter: counter,
    };
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    saveRaw(entries);
  },

  removeSite(siteName: string) {
    const entries = loadRaw().filter((e) => e.siteName !== siteName);
    saveRaw(entries);
  },

  clearAll() {
    saveRaw([]);
  },

  exportJson(): string {
    const entries = loadRaw();
    const sites: Record<string, { type: number; counter: number; last_used: string }> = {};
    for (const e of entries) {
      sites[e.siteName] = {
        type: PASSWORD_TYPE_TO_INT[e.defaultType as PasswordType] ?? 1,
        counter: e.defaultCounter,
        last_used: new Date(e.lastUsed).toISOString(),
      };
    }
    return JSON.stringify({ sites }, null, 2);
  },

  importJson(jsonStr: string): number {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('Invalid JSON');
    }
    const sitesObj = parsed?.sites;
    if (!sitesObj || typeof sitesObj !== 'object') {
      throw new Error('Malformed site history: missing "sites" object');
    }

    const entries = loadRaw();
    let imported = 0;
    for (const [siteName, value] of Object.entries<any>(sitesObj)) {
      const typeInt = typeof value.type === 'number' ? value.type : 1;
      const type = INT_TO_PASSWORD_TYPE[typeInt] ?? PasswordType.LONG;
      const counter = typeof value.counter === 'number' ? value.counter : 1;
      const lastUsed = value.last_used ? Date.parse(value.last_used) : Date.now();

      const idx = entries.findIndex((e) => e.siteName === siteName);
      const entry: SiteEntry = {
        siteName,
        lastUsed: Number.isFinite(lastUsed) ? lastUsed : Date.now(),
        defaultType: type,
        defaultCounter: counter,
      };
      if (idx >= 0) entries[idx] = entry;
      else entries.push(entry);
      imported++;
    }
    saveRaw(entries);
    return imported;
  },
};
