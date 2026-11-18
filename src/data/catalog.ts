import { CatalogDataset, EnrichedVideo } from '../types/video';
import { extractYouTubeId } from '../utils/youtube';

export const CATALOG_DATA_URL = '/assets/unified_trading_catalog.json';

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Básico',
  2: 'Intermedio',
  3: 'Avanzado',
};

export const EMPTY_CATALOG: CatalogDataset = {
  Levels: [],
  Categories: [],
  Videos: [],
};

export async function fetchCatalogData(signal?: AbortSignal): Promise<CatalogDataset> {
  const response = await fetch(CATALOG_DATA_URL, { signal });
  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (${response.status})`);
  }
  const data = (await response.json()) as CatalogDataset;
  return data;
}

const MINOR_WORDS = new Set(['y', 'de', 'del', 'la', 'las', 'los', 'en', 'que', 'para']);
const ACRONYMS = new Set(['SMC', 'RSI', 'VWAP', 'BTC', 'ETF', 'ETFs', 'TV']);

function toSpanishTitleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      if (index > 0 && MINOR_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function formatCategoryDisplayName(rawName: string): string {
  const trimmed = rawName.trim();
  const numberedMatch = trimmed.match(/^(\d+)\.-\s*(.+)$/);
  if (numberedMatch) {
    const [, num, rest] = numberedMatch;
    return `${num}. ${toSpanishTitleCase(rest)}`;
  }
  return toSpanishTitleCase(trimmed);
}

export function enrichCatalog(data: CatalogDataset): EnrichedVideo[] {
  const categoryMap = new Map(data.Categories.map((c) => [c.IdCategory, c.Name]));
  const levelMap = new Map<number, string>();
  if (Array.isArray(data.Levels)) {
    for (const lvl of data.Levels) {
      const shortName = lvl.Name.split(' - ')[0]?.trim();
      levelMap.set(lvl.IdLevel, shortName || LEVEL_LABELS[lvl.IdLevel] || 'General');
    }
  }

  return data.Videos.map((video) => ({
    ...video,
    youtubeId: extractYouTubeId(video.Url),
    categoryName: categoryMap.get(video.IdCategory) ?? 'General',
    levelLabel: levelMap.get(video.IdLevel) ?? LEVEL_LABELS[video.IdLevel] ?? 'General',
  }));
}
