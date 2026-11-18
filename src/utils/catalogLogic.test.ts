import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractYouTubeId,
  getResourceType,
  getYouTubeThumbnailCandidates,
  getYouTubeThumbnailUrl,
  formatDuration,
  formatViewCount,
} from './youtube';
import { enrichCatalog, formatCategoryDisplayName } from '../data/catalog';
import { buildRoadmapStages } from '../data/roadmap';
import { CatalogDataset } from '../types/video';
import {
  filterVideos,
  getCategoryProgressMap,
  getCategoryVideoCounts,
  groupVideosByCategory,
  normalizeSearchText,
} from './filterVideos';
import {
  parseWatchHistory,
  addVideoToHistoryList,
  removeVideoFromHistoryList,
  parseFavorites,
  toggleFavoriteInList,
  removeFavoriteFromList,
  parseRoadmapObject,
  serializeStudyBackup,
  parseStudyBackup,
} from './storage';

const datasetPath = path.resolve(process.cwd(), 'public/assets/unified_trading_catalog.json');
const CATALOG_DATA = JSON.parse(fs.readFileSync(datasetPath, 'utf8')) as CatalogDataset & {
  Tags?: unknown;
  VideoTags?: unknown;
};

test('extractYouTubeId and getResourceType handle watch, short, live, playlist, and external URLs', () => {
  assert.equal(extractYouTubeId('http://www.youtube.com/watch?v=lRYvjk6oD9U'), 'lRYvjk6oD9U');
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=O_wiszfYKZY&ab_channel=ZCoinTV'),
    'O_wiszfYKZY'
  );
  assert.equal(extractYouTubeId('https://youtu.be/z9Ushd8QgBU?si=xVGKMylP2iv2Je0a'), 'z9Ushd8QgBU');
  assert.equal(extractYouTubeId('https://www.youtube.com/embed/AG-H_ELYa_M'), 'AG-H_ELYa_M');
  assert.equal(extractYouTubeId('https://youtube.com/live/5wipn1DCN08'), '5wipn1DCN08');
  assert.equal(extractYouTubeId('https://es.tradingview.com/script/dnmjwa5o/'), null);

  assert.equal(getResourceType('https://youtube.com/live/5wipn1DCN08'), 'youtube-video');
  assert.equal(
    getResourceType('https://youtube.com/playlist?list=PLqA_i1Y8q2fS-c1q0X2z3s1'),
    'youtube-playlist'
  );
  assert.equal(getResourceType('https://es.tradingview.com/script/dnmjwa5o/'), 'external');
});

test('YouTube thumbnail helpers generate ordered high-res candidates', () => {
  const candidates = getYouTubeThumbnailCandidates('lRYvjk6oD9U');
  assert.deepEqual(candidates, [
    'https://i.ytimg.com/vi/lRYvjk6oD9U/maxresdefault.jpg',
    'https://i.ytimg.com/vi/lRYvjk6oD9U/sddefault.jpg',
    'https://i.ytimg.com/vi/lRYvjk6oD9U/hqdefault.jpg',
  ]);
  assert.equal(
    getYouTubeThumbnailUrl('http://www.youtube.com/watch?v=TXfaTw1tO9o', 'maxres'),
    'https://i.ytimg.com/vi/TXfaTw1tO9o/maxresdefault.jpg'
  );
});

test('formatDuration, formatViewCount, and formatCategoryDisplayName format Spanish catalog labels', () => {
  assert.equal(formatDuration(0), 'No disponible');
  assert.equal(formatDuration(783), '13:03');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatViewCount(0), 'Sin vistas');
  assert.match(formatViewCount(36376), /36.*376 vistas/);
  assert.equal(
    formatCategoryDisplayName('ESENCIALES DEL TRADING Y LA INVERSIÓN'),
    'Esenciales del Trading y la Inversión'
  );
  assert.equal(
    formatCategoryDisplayName('HERRAMIENTAS Y PLATAFORMAS DE TRADING QUE UTILIZAMOS'),
    'Herramientas y Plataformas de Trading que Utilizamos'
  );
  assert.equal(
    formatCategoryDisplayName('6.- ANÁLISIS TÉCNICO Y SMC'),
    '6. Análisis Técnico y SMC'
  );
});

test('tag-free catalog JSON has 156 unique videos, 9 categories, 3 levels, and zero Tags/VideoTags', () => {
  assert.equal(CATALOG_DATA.Levels?.length, 3);
  assert.equal(CATALOG_DATA.Categories.length, 9);
  assert.equal(CATALOG_DATA.Videos.length, 156);
  assert.equal(CATALOG_DATA.Tags, undefined);
  assert.equal(CATALOG_DATA.VideoTags, undefined);

  const uniqueVideoIds = new Set(CATALOG_DATA.Videos.map((v) => v.IdVideo));
  assert.equal(uniqueVideoIds.size, 156);

  const enriched = enrichCatalog(CATALOG_DATA);
  assert.equal(enriched.length, 156);
  for (const video of enriched) {
    assert.ok(video.Title.trim().length > 0, `Video ${video.IdVideo} missing Title`);
    assert.ok(video.Url.trim().length > 0, `Video ${video.IdVideo} missing Url`);
    assert.ok(video.Description.trim().length > 0, `Video ${video.IdVideo} missing Description`);
  }

  const video157 = enriched.find((v) => v.IdVideo === 157);
  assert.ok(video157);
  assert.equal(video157.IdCategory, 3);
  assert.equal(video157.Duration, 912);
  assert.equal(video157.Viewed, 4120);

  const video156 = enriched.find((v) => v.IdVideo === 156);
  assert.ok(video156);
  assert.equal(video156.Duration, 0);
  assert.equal(getResourceType(video156.Url), 'youtube-playlist');

  const video99 = enriched.find((v) => v.IdVideo === 99);
  assert.ok(video99);
  assert.equal(video99.youtubeId, null);
  assert.equal(getResourceType(video99.Url), 'external');
});

test('filterVideos provides high-precision search without noisy tag false positives and ranks title matches first', () => {
  const enriched = enrichCatalog(CATALOG_DATA);
  const baseCriteria = {
    searchQuery: '',
    selectedCategoryId: null,
    selectedLevelId: null,
    selectedChannel: null,
    watchedFilter: 'all' as const,
    watchedIds: new Set<number>([1, 4]),
    favoriteIds: new Set<number>([10, 25]),
    sortBy: 'order' as const,
  };

  assert.equal(normalizeSearchText('Análisis Técnico'), 'analisis tecnico');

  const category1Results = filterVideos(enriched, {
    ...baseCriteria,
    selectedCategoryId: 1,
  });
  assert.equal(category1Results.length, 26);
  assert.ok(category1Results.every((v) => v.IdCategory === 1));

  // Verify compound-tag noise is completely gone
  const drawdownResults = filterVideos(enriched, {
    ...baseCriteria,
    searchQuery: 'drawdown',
  });
  assert.equal(drawdownResults.length, 3);

  const oroResults = filterVideos(enriched, {
    ...baseCriteria,
    searchQuery: 'oro',
  });
  assert.equal(oroResults.length, 8);
  assert.ok(normalizeSearchText(oroResults[0].Title).includes('oro'));

  const volumeProfileResults = filterVideos(enriched, {
    ...baseCriteria,
    searchQuery: 'volume profile',
  });
  assert.equal(volumeProfileResults.length, 19);

  const wyckoffVolumeResults = filterVideos(enriched, {
    ...baseCriteria,
    searchQuery: 'wyckoff volumen',
  });
  assert.ok(wyckoffVolumeResults.length > 0 && wyckoffVolumeResults.length < 30);

  const favoriteResults = filterVideos(enriched, {
    ...baseCriteria,
    watchedFilter: 'favorites',
  });
  assert.deepEqual(
    favoriteResults.map((v) => v.IdVideo),
    [10, 25]
  );

  const watchedResults = filterVideos(enriched, {
    ...baseCriteria,
    watchedFilter: 'watched',
  });
  assert.deepEqual(
    watchedResults.map((v) => v.IdVideo),
    [1, 4]
  );

  const titleSorted = filterVideos(enriched, {
    ...baseCriteria,
    sortBy: 'title-asc',
  });
  assert.ok(titleSorted[0].Title.localeCompare(titleSorted[1].Title, 'es') <= 0);
});

test('buildRoadmapStages groups all 156 unique videos into 6 progressive stages ordered by level', () => {
  const enriched = enrichCatalog(CATALOG_DATA);
  const stages = buildRoadmapStages(enriched);

  assert.equal(stages.length, 6);
  const seenIds = new Set<number>();
  for (const stage of stages) {
    assert.ok(stage.videos.length > 0, `Stage ${stage.id} must have videos`);
    for (let i = 0; i < stage.videos.length; i++) {
      const video = stage.videos[i];
      assert.equal(seenIds.has(video.IdVideo), false, `Duplicate video ${video.IdVideo} in roadmap`);
      seenIds.add(video.IdVideo);
      if (i > 0) {
        assert.ok(
          stage.videos[i - 1].IdLevel <= video.IdLevel,
          `Stage ${stage.id} is not sorted by IdLevel`
        );
      }
    }
  }
  assert.equal(seenIds.size, 156);
});

test('category counts, per-category progress, and category grouping work accurately', () => {
  const enriched = enrichCatalog(CATALOG_DATA);
  const catCounts = getCategoryVideoCounts(enriched, CATALOG_DATA.Categories);
  const sum = Array.from(catCounts.values()).reduce((acc, n) => acc + n, 0);
  assert.equal(sum, 156);

  const cat1Ids = enriched.filter((v) => v.IdCategory === 1).slice(0, 13).map((v) => v.IdVideo);
  const progressMap = getCategoryProgressMap(enriched, CATALOG_DATA.Categories, new Set(cat1Ids));
  const cat1Progress = progressMap.get(1);
  assert.ok(cat1Progress);
  assert.equal(cat1Progress.watched, 13);
  assert.equal(cat1Progress.total, 26);
  assert.equal(cat1Progress.percent, 50);

  const cat2Progress = progressMap.get(2);
  assert.ok(cat2Progress);
  assert.equal(cat2Progress.watched, 0);
  assert.equal(cat2Progress.percent, 0);

  const groups = groupVideosByCategory(enriched.slice(0, 12), enriched, CATALOG_DATA.Categories);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].videos.length, 12);
  assert.equal(groups[0].totalInCategory, 26);
});

test('watch history, favorites, roadmap state, and JSON backup helpers validate and round-trip cleanly', () => {
  const initialHistory = parseWatchHistory(
    JSON.stringify([
      { videoId: 3, watchedAt: 100 },
      { videoId: 1, watchedAt: 200 },
      { videoId: 3, watchedAt: 50 },
      { bad: 'shape' },
    ])
  );
  assert.deepEqual(initialHistory, [
    { videoId: 1, watchedAt: 200 },
    { videoId: 3, watchedAt: 100 },
  ]);

  const updatedHistory = addVideoToHistoryList(initialHistory, 3, 300);
  assert.deepEqual(updatedHistory, [
    { videoId: 3, watchedAt: 300 },
    { videoId: 1, watchedAt: 200 },
  ]);

  const removedHistory = removeVideoFromHistoryList(updatedHistory, 1);
  assert.deepEqual(removedHistory, [{ videoId: 3, watchedAt: 300 }]);

  const initialFavorites = parseFavorites(JSON.stringify([5, 12, 5, -1, 'invalid', 30]));
  assert.deepEqual(initialFavorites, [5, 12, 30]);

  const addedFav = toggleFavoriteInList(initialFavorites, 42);
  assert.deepEqual(addedFav, [42, 5, 12, 30]);

  const toggledOffFav = toggleFavoriteInList(addedFav, 12);
  assert.deepEqual(toggledOffFav, [42, 5, 30]);

  const removedFav = removeFavoriteFromList(toggledOffFav, 42);
  assert.deepEqual(removedFav, [5, 30]);

  const validIds = new Set(CATALOG_DATA.Videos.map((v) => v.IdVideo));
  const parsedRoadmap = parseRoadmapObject(
    { started: true, startedAt: 123456, completedIds: [1, 999999, 1, 10] },
    validIds
  );
  assert.deepEqual(parsedRoadmap, {
    started: true,
    startedAt: 123456,
    completedIds: [1, 10],
  });

  // JSON Backup serialization & parsing roundtrip with roadmap
  const backupJson = serializeStudyBackup({
    theme: 'light',
    favorites: [11, 25],
    history: [
      { videoId: 11, watchedAt: 1000 },
      { videoId: 99999, watchedAt: 900 },
    ],
    roadmap: parsedRoadmap,
    exportedAt: '2026-01-01T00:00:00.000Z',
  });
  const parsed = parseStudyBackup(backupJson, validIds);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.theme, 'light');
    assert.deepEqual(parsed.data.favorites, [11, 25]);
    assert.deepEqual(parsed.data.history, [{ videoId: 11, watchedAt: 1000 }]);
    assert.deepEqual(parsed.data.roadmap, parsedRoadmap);
  }

  // Malformed or unrelated JSON rejection
  const badJson = parseStudyBackup('{not valid json');
  assert.equal(badJson.ok, false);

  const wrongShape = parseStudyBackup(JSON.stringify({ hello: 'world' }));
  assert.equal(wrongShape.ok, false);
});
