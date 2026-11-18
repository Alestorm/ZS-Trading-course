export interface Level {
  IdLevel: number;
  Name: string;
}

export interface Category {
  IdCategory: number;
  Name: string;
}

export interface Video {
  IdVideo: number;
  Title: string;
  Url: string;
  Description: string;
  Duration: number;
  Channel: string;
  Viewed: number;
  IdLevel: number;
  IdCategory: number;
  SearchKeywords?: string[];
}

export interface CatalogDataset {
  Levels?: Level[];
  Categories: Category[];
  Videos: Video[];
}

export interface EnrichedVideo extends Video {
  youtubeId: string | null;
  categoryName: string;
  levelLabel: string;
}

export interface CategoryProgress {
  categoryId: number;
  watched: number;
  total: number;
  percent: number;
}

export type AppSection = 'catalog' | 'roadmap';

export type ThemeMode = 'dark' | 'light';

export type SortOption = 'order' | 'views-desc' | 'duration-asc' | 'duration-desc' | 'title-asc';

export type WatchedFilter = 'all' | 'watched' | 'unwatched' | 'favorites';

export interface WatchHistoryEntry {
  videoId: number;
  watchedAt: number;
}

export interface RoadmapState {
  started: boolean;
  startedAt: number | null;
  completedIds: number[];
}

export interface RoadmapStage {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  levelSummary: string;
  videos: EnrichedVideo[];
}

export interface StudyBackupPayload {
  version: 1;
  exportedAt: string;
  theme: ThemeMode;
  favorites: number[];
  history: WatchHistoryEntry[];
  roadmap?: RoadmapState;
}
