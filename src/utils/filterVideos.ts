import {
  Category,
  CategoryProgress,
  EnrichedVideo,
  SortOption,
  WatchedFilter,
} from '../types/video';

export interface FilterCriteria {
  searchQuery: string;
  selectedCategoryId: number | null;
  selectedLevelId: number | null;
  selectedChannel: string | null;
  watchedFilter: WatchedFilter;
  watchedIds: ReadonlySet<number>;
  favoriteIds?: ReadonlySet<number>;
  sortBy: SortOption;
}

/**
 * Normalizes text for accent-insensitive, case-insensitive Spanish search.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSearchRelevanceScore(video: EnrichedVideo, tokens: string[]): number {
  const titleNorm = normalizeSearchText(video.Title);
  const ytAndCatNorm = normalizeSearchText(
    [video.categoryName, video.Channel, ...(video.SearchKeywords ?? [])].join(' ')
  );

  let score = 0;
  for (const token of tokens) {
    if (titleNorm.includes(token)) {
      score += 4;
    } else if (ytAndCatNorm.includes(token)) {
      score += 2;
    } else {
      score += 1;
    }
  }
  return score;
}

export function filterVideos(
  videos: EnrichedVideo[],
  criteria: FilterCriteria
): EnrichedVideo[] {
  const query = normalizeSearchText(criteria.searchQuery);
  const queryTokens = query.length > 0 ? query.split(/\s+/).filter(Boolean) : [];

  const filtered = videos.filter((video) => {
    if (criteria.selectedCategoryId !== null && video.IdCategory !== criteria.selectedCategoryId) {
      return false;
    }

    if (criteria.selectedLevelId !== null && video.IdLevel !== criteria.selectedLevelId) {
      return false;
    }

    if (criteria.selectedChannel !== null && video.Channel !== criteria.selectedChannel) {
      return false;
    }

    if (criteria.watchedFilter === 'watched' && !criteria.watchedIds.has(video.IdVideo)) {
      return false;
    }
    if (criteria.watchedFilter === 'unwatched' && criteria.watchedIds.has(video.IdVideo)) {
      return false;
    }
    if (
      criteria.watchedFilter === 'favorites' &&
      !(criteria.favoriteIds?.has(video.IdVideo) ?? false)
    ) {
      return false;
    }

    if (queryTokens.length > 0) {
      const corpus = normalizeSearchText(
        [
          `#${video.IdVideo}`,
          video.Title,
          video.Description,
          video.Channel,
          video.categoryName,
          video.levelLabel,
          ...(video.SearchKeywords ?? []),
        ].join(' ')
      );
      const matches = queryTokens.every((token) => corpus.includes(token));
      if (!matches) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  switch (criteria.sortBy) {
    case 'views-desc':
      sorted.sort((a, b) => b.Viewed - a.Viewed || a.IdVideo - b.IdVideo);
      break;
    case 'duration-asc':
      sorted.sort((a, b) => {
        if (a.Duration === 0 && b.Duration === 0) return a.IdVideo - b.IdVideo;
        if (a.Duration === 0) return 1;
        if (b.Duration === 0) return -1;
        return a.Duration - b.Duration || a.IdVideo - b.IdVideo;
      });
      break;
    case 'duration-desc':
      sorted.sort((a, b) => b.Duration - a.Duration || a.IdVideo - b.IdVideo);
      break;
    case 'title-asc':
      sorted.sort((a, b) => a.Title.localeCompare(b.Title, 'es'));
      break;
    case 'order':
    default:
      if (queryTokens.length > 0) {
        sorted.sort(
          (a, b) =>
            getSearchRelevanceScore(b, queryTokens) - getSearchRelevanceScore(a, queryTokens) ||
            a.IdCategory - b.IdCategory ||
            a.IdVideo - b.IdVideo
        );
      } else {
        sorted.sort((a, b) => a.IdCategory - b.IdCategory || a.IdVideo - b.IdVideo);
      }
      break;
  }

  return sorted;
}

export function getCategoryVideoCounts(
  videos: EnrichedVideo[],
  categories: Category[]
): Map<number, number> {
  const counts = new Map<number, number>();
  for (const category of categories) {
    counts.set(category.IdCategory, 0);
  }
  for (const video of videos) {
    counts.set(video.IdCategory, (counts.get(video.IdCategory) ?? 0) + 1);
  }
  return counts;
}

export function getCategoryProgressMap(
  videos: EnrichedVideo[],
  categories: Category[],
  watchedIds: ReadonlySet<number>
): Map<number, CategoryProgress> {
  const totals = new Map<number, number>();
  const watchedCounts = new Map<number, number>();

  for (const category of categories) {
    totals.set(category.IdCategory, 0);
    watchedCounts.set(category.IdCategory, 0);
  }

  for (const video of videos) {
    totals.set(video.IdCategory, (totals.get(video.IdCategory) ?? 0) + 1);
    if (watchedIds.has(video.IdVideo)) {
      watchedCounts.set(video.IdCategory, (watchedCounts.get(video.IdCategory) ?? 0) + 1);
    }
  }

  const progressMap = new Map<number, CategoryProgress>();
  for (const category of categories) {
    const total = totals.get(category.IdCategory) ?? 0;
    const watched = watchedCounts.get(category.IdCategory) ?? 0;
    const percent = total > 0 ? Math.round((watched / total) * 100) : 0;
    progressMap.set(category.IdCategory, {
      categoryId: category.IdCategory,
      watched,
      total,
      percent,
    });
  }

  return progressMap;
}

export interface CategoryGroup {
  category: Category;
  videos: EnrichedVideo[];
  totalInCategory: number;
}

export function groupVideosByCategory(
  visibleVideos: EnrichedVideo[],
  allFilteredVideos: EnrichedVideo[],
  categories: Category[]
): CategoryGroup[] {
  const totalCounts = new Map<number, number>();
  for (const video of allFilteredVideos) {
    totalCounts.set(video.IdCategory, (totalCounts.get(video.IdCategory) ?? 0) + 1);
  }

  const groupedMap = new Map<number, EnrichedVideo[]>();
  for (const video of visibleVideos) {
    const list = groupedMap.get(video.IdCategory) ?? [];
    list.push(video);
    groupedMap.set(video.IdCategory, list);
  }

  const groups: CategoryGroup[] = [];
  for (const category of categories) {
    const videos = groupedMap.get(category.IdCategory);
    if (videos && videos.length > 0) {
      groups.push({
        category,
        videos,
        totalInCategory: totalCounts.get(category.IdCategory) ?? videos.length,
      });
    }
  }
  return groups;
}
