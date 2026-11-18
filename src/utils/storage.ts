import { RoadmapState, StudyBackupPayload, ThemeMode, WatchHistoryEntry } from '../types/video';

export const WATCH_HISTORY_STORAGE_KEY = 'zs_academy_watch_history_v1';
export const FAVORITES_STORAGE_KEY = 'zs_academy_favorites_v1';
export const THEME_STORAGE_KEY = 'zs_academy_theme_v1';
export const ROADMAP_STORAGE_KEY = 'zs_academy_roadmap_v1';
const MAX_HISTORY_ENTRIES = 500;

export const DEFAULT_ROADMAP_STATE: RoadmapState = {
  started: false,
  startedAt: null,
  completedIds: [],
};

export function parseWatchHistory(raw: string | null): WatchHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<number>();
    const valid: WatchHistoryEntry[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.videoId === 'number' &&
        Number.isInteger(item.videoId) &&
        !seen.has(item.videoId)
      ) {
        seen.add(item.videoId);
        valid.push({
          videoId: item.videoId,
          watchedAt: typeof item.watchedAt === 'number' ? item.watchedAt : Date.now(),
        });
      }
    }
    return valid.sort((a, b) => b.watchedAt - a.watchedAt);
  } catch {
    return [];
  }
}

export function addVideoToHistoryList(
  history: WatchHistoryEntry[],
  videoId: number,
  timestamp: number = Date.now()
): WatchHistoryEntry[] {
  const filtered = history.filter((entry) => entry.videoId !== videoId);
  return [{ videoId, watchedAt: timestamp }, ...filtered].slice(0, MAX_HISTORY_ENTRIES);
}

export function removeVideoFromHistoryList(
  history: WatchHistoryEntry[],
  videoId: number
): WatchHistoryEntry[] {
  return history.filter((entry) => entry.videoId !== videoId);
}

export function loadWatchHistory(): WatchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return parseWatchHistory(window.localStorage.getItem(WATCH_HISTORY_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveWatchHistory(history: WatchHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function parseFavorites(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<number>();
    const valid: number[] = [];
    for (const item of parsed) {
      if (typeof item === 'number' && Number.isInteger(item) && item > 0 && !seen.has(item)) {
        seen.add(item);
        valid.push(item);
      }
    }
    return valid;
  } catch {
    return [];
  }
}

export function toggleFavoriteInList(favorites: number[], videoId: number): number[] {
  if (favorites.includes(videoId)) {
    return favorites.filter((id) => id !== videoId);
  }
  return [videoId, ...favorites];
}

export function removeFavoriteFromList(favorites: number[], videoId: number): number[] {
  return favorites.filter((id) => id !== videoId);
}

export function loadFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return parseFavorites(window.localStorage.getItem(FAVORITES_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage errors
  }
}

export function loadStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}

export function parseRoadmapObject(
  input: unknown,
  validVideoIds?: ReadonlySet<number>
): RoadmapState {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ...DEFAULT_ROADMAP_STATE };
  }
  const obj = input as Record<string, unknown>;
  const started = Boolean(obj.started);
  const startedAt =
    typeof obj.startedAt === 'number' && Number.isFinite(obj.startedAt) ? obj.startedAt : null;
  const rawCompleted = Array.isArray(obj.completedIds) ? obj.completedIds : [];
  const seen = new Set<number>();
  const completedIds: number[] = [];
  for (const id of rawCompleted) {
    if (typeof id === 'number' && Number.isInteger(id) && id > 0 && !seen.has(id)) {
      if (validVideoIds && !validVideoIds.has(id)) continue;
      seen.add(id);
      completedIds.push(id);
    }
  }
  return {
    started: started || completedIds.length > 0,
    startedAt: startedAt ?? (completedIds.length > 0 ? Date.now() : null),
    completedIds,
  };
}

export function loadRoadmapState(): RoadmapState {
  if (typeof window === 'undefined') return { ...DEFAULT_ROADMAP_STATE };
  try {
    const raw = window.localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ROADMAP_STATE };
    return parseRoadmapObject(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_ROADMAP_STATE };
  }
}

export function saveRoadmapState(state: RoadmapState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function serializeStudyBackup(input: {
  theme: ThemeMode;
  favorites: number[];
  history: WatchHistoryEntry[];
  roadmap?: RoadmapState;
  exportedAt?: string;
}): string {
  const payload: StudyBackupPayload = {
    version: 1,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    theme: input.theme,
    favorites: input.favorites,
    history: input.history,
    ...(input.roadmap ? { roadmap: input.roadmap } : {}),
  };
  return JSON.stringify(payload, null, 2);
}

export type ParsedBackupResult =
  | { ok: true; data: StudyBackupPayload }
  | { ok: false; error: string };

export function parseStudyBackup(
  raw: string,
  validVideoIds?: ReadonlySet<number>
): ParsedBackupResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'El archivo está vacío.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'El archivo no contiene un JSON válido.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Formato de respaldo inválido.' };
  }

  const record = parsed as Record<string, unknown>;
  if (!Array.isArray(record.history) && !Array.isArray(record.favorites) && !record.roadmap) {
    return {
      ok: false,
      error: 'El archivo no corresponde a un respaldo de Videoteca ZS.',
    };
  }

  const rawHistory = Array.isArray(record.history) ? record.history : [];
  const seenHistory = new Set<number>();
  const validHistory: WatchHistoryEntry[] = [];
  for (const item of rawHistory) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as WatchHistoryEntry).videoId === 'number' &&
      Number.isInteger((item as WatchHistoryEntry).videoId) &&
      (item as WatchHistoryEntry).videoId > 0
    ) {
      const videoId = (item as WatchHistoryEntry).videoId;
      if (validVideoIds && !validVideoIds.has(videoId)) continue;
      if (seenHistory.has(videoId)) continue;
      seenHistory.add(videoId);
      const watchedAt =
        typeof (item as WatchHistoryEntry).watchedAt === 'number' &&
        Number.isFinite((item as WatchHistoryEntry).watchedAt)
          ? (item as WatchHistoryEntry).watchedAt
          : Date.now();
      validHistory.push({ videoId, watchedAt });
    }
  }
  validHistory.sort((a, b) => b.watchedAt - a.watchedAt);

  const rawFavorites = Array.isArray(record.favorites) ? record.favorites : [];
  const seenFavs = new Set<number>();
  const validFavorites: number[] = [];
  for (const item of rawFavorites) {
    if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
      if (validVideoIds && !validVideoIds.has(item)) continue;
      if (seenFavs.has(item)) continue;
      seenFavs.add(item);
      validFavorites.push(item);
    }
  }

  const theme: ThemeMode = record.theme === 'light' ? 'light' : 'dark';
  const exportedAt =
    typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString();
  const roadmap = record.roadmap
    ? parseRoadmapObject(record.roadmap, validVideoIds)
    : undefined;

  return {
    ok: true,
    data: {
      version: 1,
      exportedAt,
      theme,
      favorites: validFavorites,
      history: validHistory.slice(0, MAX_HISTORY_ENTRIES),
      ...(roadmap ? { roadmap } : {}),
    },
  };
}
