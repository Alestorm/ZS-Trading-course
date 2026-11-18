import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  ExternalLink,
  FolderOpen,
  Heart,
  Layers,
  Menu,
  RotateCcw,
  Search,
  SearchX,
  X,
} from 'lucide-react';
import {
  EMPTY_CATALOG,
  enrichCatalog,
  fetchCatalogData,
  formatCategoryDisplayName,
} from './data/catalog';
import {
  AppSection,
  CatalogDataset,
  EnrichedVideo,
  SortOption,
  WatchedFilter,
} from './types/video';
import {
  filterVideos,
  getCategoryProgressMap,
  getCategoryVideoCounts,
  groupVideosByCategory,
} from './utils/filterVideos';
import { parseStudyBackup, serializeStudyBackup } from './utils/storage';
import { getResourceType } from './utils/youtube';
import { useTheme } from './hooks/useTheme';
import { useWatchHistory } from './hooks/useWatchHistory';
import { useFavorites } from './hooks/useFavorites';
import { useRoadmap } from './hooks/useRoadmap';
import { BrandLogo } from './components/BrandLogo';
import { ThemeToggle } from './components/ThemeToggle';
import { SidebarNav } from './components/SidebarNav';
import { FeaturedVideoBanner } from './components/FeaturedVideoBanner';
import { CatalogViewMode, SearchAndFilters } from './components/SearchAndFilters';
import { VideoCard } from './components/VideoCard';
import { StudyProgressWidget } from './components/StudyProgressWidget';
import { FavoritesPanel } from './components/FavoritesPanel';
import { RecentHistoryPanel } from './components/RecentHistoryPanel';
import { RoadmapSection } from './components/RoadmapSection';

const BATCH_SIZE = 12;

export default function App() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { history, watchedIds, markAsWatched, unmarkWatched, clearHistory, replaceHistory } =
    useWatchHistory();
  const {
    favoriteOrder,
    favoriteIds,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    replaceFavorites,
  } = useFavorites();
  const {
    roadmapState,
    completedIdsSet,
    startRoadmap,
    markStepCompleted,
    toggleStepCompleted,
    resetRoadmap,
    replaceRoadmap,
  } = useRoadmap();

  const [catalog, setCatalog] = useState<CatalogDataset>(EMPTY_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  const [activeSection, setActiveSection] = useState<AppSection>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [watchedFilter, setWatchedFilter] = useState<WatchedFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchCatalogData(controller.signal)
      .then((data) => {
        setCatalog(data);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el catálogo de clases.'
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadAttempt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeSection !== 'catalog') return;
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  const allVideos = useMemo(() => enrichCatalog(catalog), [catalog]);

  const videoMap = useMemo(
    () => new Map(allVideos.map((video) => [video.IdVideo, video])),
    [allVideos]
  );

  const channels = useMemo(
    () =>
      Array.from(new Set(allVideos.map((v) => v.Channel.trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'es')
      ),
    [allVideos]
  );

  const hasDurationData = useMemo(() => allVideos.some((v) => v.Duration > 0), [allVideos]);
  const hasViewData = useMemo(() => allVideos.some((v) => v.Viewed > 0), [allVideos]);

  const categoryCounts = useMemo(
    () => getCategoryVideoCounts(allVideos, catalog.Categories),
    [allVideos, catalog.Categories]
  );

  const categoryProgress = useMemo(
    () => getCategoryProgressMap(allVideos, catalog.Categories, watchedIds),
    [allVideos, catalog.Categories, watchedIds]
  );

  const filteredVideos = useMemo(
    () =>
      filterVideos(allVideos, {
        searchQuery,
        selectedCategoryId,
        selectedLevelId,
        selectedChannel,
        watchedFilter,
        watchedIds,
        favoriteIds,
        sortBy,
      }),
    [
      allVideos,
      searchQuery,
      selectedCategoryId,
      selectedLevelId,
      selectedChannel,
      watchedFilter,
      watchedIds,
      favoriteIds,
      sortBy,
    ]
  );

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [
    searchQuery,
    selectedCategoryId,
    selectedLevelId,
    selectedChannel,
    watchedFilter,
    sortBy,
  ]);

  const hasMore = visibleCount < filteredVideos.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredVideos.length));
  }, [filteredVideos.length]);

  useEffect(() => {
    if (activeSection !== 'catalog') return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredVideos.length));
        }
      },
      { rootMargin: '260px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeSection, hasMore, filteredVideos.length]);

  const visibleVideos = useMemo(
    () => filteredVideos.slice(0, visibleCount),
    [filteredVideos, visibleCount]
  );

  const showGroupedByCategory = selectedCategoryId === null && sortBy === 'order';

  const categoryGroups = useMemo(() => {
    if (!showGroupedByCategory) return [];
    return groupVideosByCategory(visibleVideos, filteredVideos, catalog.Categories);
  }, [showGroupedByCategory, visibleVideos, filteredVideos, catalog.Categories]);

  const selectedCategory = useMemo(
    () => catalog.Categories.find((c) => c.IdCategory === selectedCategoryId) ?? null,
    [catalog.Categories, selectedCategoryId]
  );

  const { heroVideo, isLastWatched } = useMemo(() => {
    if (allVideos.length === 0) {
      return { heroVideo: undefined, isLastWatched: false };
    }
    for (const entry of history) {
      const matched: EnrichedVideo | undefined = videoMap.get(entry.videoId);
      if (matched) {
        return { heroVideo: matched, isLastWatched: true };
      }
    }
    return {
      heroVideo: allVideos.find((v) => v.IdVideo === 11) ?? allVideos[0],
      isLastWatched: false,
    };
  }, [allVideos, history, videoMap]);

  const queueVideos = useMemo(() => {
    const unwatched = allVideos.filter(
      (v) => !watchedIds.has(v.IdVideo) && getResourceType(v.Url) !== 'external'
    );
    if (unwatched.length >= 4) return unwatched.slice(0, 4);
    return allVideos.filter((v) => getResourceType(v.Url) !== 'external').slice(0, 4);
  }, [allVideos, watchedIds]);

  const totalCatalogMinutes = useMemo(
    () => Math.round(allVideos.reduce((acc, v) => acc + v.Duration, 0) / 60),
    [allVideos]
  );

  const watchedMinutes = useMemo(
    () =>
      Math.round(
        allVideos.reduce((acc, v) => (watchedIds.has(v.IdVideo) ? acc + v.Duration : acc), 0) / 60
      ),
    [allVideos, watchedIds]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategoryId !== null ||
    selectedLevelId !== null ||
    selectedChannel !== null ||
    watchedFilter !== 'all' ||
    sortBy !== 'order';

  const handleToggleWatched = (videoId: number) => {
    if (watchedIds.has(videoId)) {
      unmarkWatched(videoId);
    } else {
      markAsWatched(videoId);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
    setSelectedLevelId(null);
    setSelectedChannel(null);
    setWatchedFilter('all');
    setSortBy('order');
  };

  const handleToggleFilterFavorites = () => {
    if (activeSection !== 'catalog') {
      setActiveSection('catalog');
      setWatchedFilter('favorites');
      return;
    }
    setWatchedFilter((prev) => (prev === 'favorites' ? 'all' : 'favorites'));
  };

  const handleExportBackup = useCallback(() => {
    const json = serializeStudyBackup({
      theme,
      favorites: favoriteOrder,
      history,
      roadmap: roadmapState,
    });
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zs-videoteca-respaldo-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [theme, favoriteOrder, history, roadmapState]);

  const handleImportBackup = useCallback(
    async (file: File): Promise<{ ok: boolean; message: string }> => {
      try {
        const raw = await file.text();
        const validIds = allVideos.length > 0 ? new Set(allVideos.map((v) => v.IdVideo)) : undefined;
        const result = parseStudyBackup(raw, validIds);
        if (!result.ok) {
          return { ok: false, message: result.error };
        }
        replaceHistory(result.data.history);
        replaceFavorites(result.data.favorites);
        if (result.data.roadmap) {
          replaceRoadmap(result.data.roadmap);
        }
        setTheme(result.data.theme);
        const watchedTotal = result.data.history.length;
        const favTotal = result.data.favorites.length;
        return {
          ok: true,
          message: `Respaldo restaurado: ${watchedTotal} ${watchedTotal === 1 ? 'clase vista' : 'clases vistas'} y ${favTotal} ${favTotal === 1 ? 'favorito' : 'favoritos'}.`,
        };
      } catch {
        return { ok: false, message: 'No se pudo leer el archivo seleccionado.' };
      }
    },
    [allVideos, replaceHistory, replaceFavorites, replaceRoadmap, setTheme]
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      {/* Clean Sticky Minimalist Tailwind Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú de navegación"
              className="lg:hidden rounded-lg p-1.5 -ml-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <BrandLogo hideTextOnMobile />

            {/* Top Section Switcher */}
            <nav
              aria-label="Cambiar de sección"
              className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900 p-0.5 gap-0.5"
            >
              <button
                type="button"
                onClick={() => setActiveSection('catalog')}
                aria-pressed={activeSection === 'catalog'}
                data-testid="nav-tab-catalog"
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === 'catalog'
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Videoteca</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('roadmap')}
                aria-pressed={activeSection === 'roadmap'}
                data-testid="nav-tab-roadmap"
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === 'roadmap'
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <Compass
                  className={`h-3.5 w-3.5 ${
                    activeSection === 'roadmap' ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>Roadmap</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://sessions-zs-time-zones.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="header-sessions-link"
              title="Abrir reloj de sesiones de mercado y zonas horarias"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <span>Sesiones de Mercado</span>
              <ExternalLink className="h-3 w-3 text-zinc-400 shrink-0" aria-hidden="true" />
            </a>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-w-0">
        {/* Clean Minimalist Tailwind Sidebar (Desktop) + Drawer (Mobile) */}
        <SidebarNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          roadmapStarted={roadmapState.started}
          roadmapCompletedCount={completedIdsSet.size}
          roadmapTotalCount={allVideos.length}
          categories={catalog.Categories}
          categoryCounts={categoryCounts}
          categoryProgress={categoryProgress}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          watchedFilter={watchedFilter}
          onSelectWatchedFilter={setWatchedFilter}
          watchedCount={watchedIds.size}
          favoritesCount={favoriteIds.size}
          totalCount={allVideos.length}
          onResetAll={handleResetFilters}
          theme={theme}
          onToggleTheme={toggleTheme}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Workspace */}
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1380px] space-y-6">
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white [text-wrap:balance]">
                {activeSection === 'roadmap'
                  ? 'Roadmap de Estudio'
                  : selectedCategory
                    ? formatCategoryDisplayName(selectedCategory.Name)
                    : 'Videoteca de Trading e Inversión'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {isLoading
                  ? 'Cargando catálogo completo de clases...'
                  : activeSection === 'roadmap'
                    ? 'Ruta guiada paso a paso independiente de tu historial de la Videoteca, con acceso directo a tus Favoritos.'
                    : `Explora ${allVideos.length} clases divididas en ${catalog.Categories.length} categorías por nivel y progreso.`}
              </p>
            </div>

            {loadError ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900/40 px-6 py-14 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                  No se pudo cargar el catálogo
                </h2>
                <p className="mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => setReloadAttempt((prev) => prev + 1)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Reintentar carga</span>
                </button>
              </div>
            ) : isLoading ? (
              <div className="space-y-6" aria-busy="true" aria-label="Cargando clases">
                <div className="h-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : activeSection === 'roadmap' ? (
              <div className="flex flex-col xl:flex-row gap-6">
                <main className="min-w-0 flex-1">
                  <RoadmapSection
                    videos={allVideos}
                    roadmapState={roadmapState}
                    completedIdsSet={completedIdsSet}
                    favoriteIds={favoriteIds}
                    onStartRoadmap={startRoadmap}
                    onToggleStepCompleted={toggleStepCompleted}
                    onMarkStepCompleted={markStepCompleted}
                    onResetRoadmap={resetRoadmap}
                    onToggleFavorite={toggleFavorite}
                    onBackToCatalog={() => setActiveSection('catalog')}
                  />
                </main>

                <aside className="w-full xl:w-76 shrink-0">
                  <div className="xl:sticky xl:top-20 space-y-5">
                    <FavoritesPanel
                      favoriteOrder={favoriteOrder}
                      videoMap={videoMap}
                      isFilteringFavorites={false}
                      onFilterFavorites={handleToggleFilterFavorites}
                      onWatch={markStepCompleted}
                      onRemoveFavorite={removeFavorite}
                      onClearFavorites={clearFavorites}
                    />
                  </div>
                </aside>
              </div>
            ) : (
              <div className="flex flex-col xl:flex-row gap-6">
                <main className="min-w-0 flex-1 space-y-6">
                  {/* Large Minimalist Search Input (outside navbar) */}
                  <div className="relative w-full">
                    <label htmlFor="catalog-search" className="sr-only">
                      Buscar videos por título, tema o canal
                    </label>
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      id="catalog-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' && searchQuery) {
                          setSearchQuery('');
                        }
                      }}
                      placeholder="Buscar clase, estrategia, tema o canal..."
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3.5 pl-12 pr-14 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-xs focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all"
                    />

                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Limpiar búsqueda"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <kbd
                        aria-hidden="true"
                        className="hidden sm:inline-flex absolute right-4 top-1/2 -translate-y-1/2 items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400"
                      >
                        /
                      </kbd>
                    )}
                  </div>

                  {!hasActiveFilters && heroVideo && (
                    <FeaturedVideoBanner
                      video={heroVideo}
                      isLastWatched={isLastWatched}
                      isWatched={watchedIds.has(heroVideo.IdVideo)}
                      isFavorite={favoriteIds.has(heroVideo.IdVideo)}
                      queueVideos={queueVideos}
                      watchedIds={watchedIds}
                      onWatch={markAsWatched}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}

                  <SearchAndFilters
                    categories={catalog.Categories}
                    categoryCounts={categoryCounts}
                    selectedCategoryId={selectedCategoryId}
                    onCategoryChange={setSelectedCategoryId}
                    selectedLevelId={selectedLevelId}
                    onLevelChange={setSelectedLevelId}
                    channels={channels}
                    selectedChannel={selectedChannel}
                    onChannelChange={setSelectedChannel}
                    watchedFilter={watchedFilter}
                    onWatchedFilterChange={setWatchedFilter}
                    favoritesCount={favoriteIds.size}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                    totalMatching={filteredVideos.length}
                    totalVideos={allVideos.length}
                    hasDurationData={hasDurationData}
                    hasViewData={hasViewData}
                  />

                  {filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-6 py-16 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200">
                        {watchedFilter === 'favorites' ? (
                          <Heart className="h-5 w-5 text-rose-500" aria-hidden="true" />
                        ) : (
                          <SearchX className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                      <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                        {watchedFilter === 'favorites' && favoriteIds.size === 0
                          ? 'Aún no tienes clases favoritas'
                          : 'No se encontraron clases'}
                      </h2>
                      <p className="mt-1.5 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                        {watchedFilter === 'favorites' && favoriteIds.size === 0
                          ? 'Marca el icono de corazón en cualquier clase del catálogo o del Roadmap para guardarla en tu lista de favoritos.'
                          : 'No hay videos que coincidan con los filtros actuales. Prueba cambiando de categoría o limpiando la búsqueda.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span>Mostrar todas las clases</span>
                      </button>
                    </div>
                  ) : (
                    <section aria-label="Listado de videos" data-testid="video-grid" className="space-y-8">
                      {showGroupedByCategory ? (
                        categoryGroups.map((group) => {
                          const catStat = categoryProgress.get(group.category.IdCategory);
                          const catWatched = catStat?.watched ?? 0;
                          const catTotal = catStat?.total ?? group.totalInCategory;
                          const catPercent = catStat?.percent ?? 0;
                          return (
                            <section
                              key={group.category.IdCategory}
                              aria-label={formatCategoryDisplayName(group.category.Name)}
                              data-testid={`category-section-${group.category.IdCategory}`}
                              className="space-y-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200">
                                    <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                                  </span>
                                  <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-zinc-950 dark:text-white truncate">
                                    {formatCategoryDisplayName(group.category.Name)}
                                  </h2>
                                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                    {group.videos.length < group.totalInCategory
                                      ? `${group.videos.length} de ${group.totalInCategory}`
                                      : `${group.totalInCategory} ${group.totalInCategory === 1 ? 'clase' : 'clases'}`}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex items-center gap-2"
                                    title={`Progreso en ${formatCategoryDisplayName(group.category.Name)}: ${catWatched} de ${catTotal}`}
                                  >
                                    <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                      {catWatched}/{catTotal} vistas · {catPercent}%
                                    </span>
                                    <div
                                      aria-hidden="true"
                                      className="hidden sm:block h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                                    >
                                      <div
                                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${catPercent}%` }}
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedCategoryId(group.category.IdCategory)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                                  >
                                    <span>Ver solo categoría</span>
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>

                              <div
                                className={
                                  viewMode === 'list'
                                    ? 'flex flex-col gap-3'
                                    : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5'
                                }
                              >
                                {group.videos.map((video) => (
                                  <VideoCard
                                    key={video.IdVideo}
                                    video={video}
                                    isWatched={watchedIds.has(video.IdVideo)}
                                    isFavorite={favoriteIds.has(video.IdVideo)}
                                    viewMode={viewMode}
                                    onWatch={markAsWatched}
                                    onToggleWatched={handleToggleWatched}
                                    onToggleFavorite={toggleFavorite}
                                  />
                                ))}
                              </div>
                            </section>
                          );
                        })
                      ) : (
                        <div className="space-y-4">
                          {selectedCategory && (() => {
                            const catStat = categoryProgress.get(selectedCategory.IdCategory);
                            const catWatched = catStat?.watched ?? 0;
                            const catTotal = catStat?.total ?? filteredVideos.length;
                            const catPercent = catStat?.percent ?? 0;
                            return (
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200">
                                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                                  </span>
                                  <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-zinc-950 dark:text-white truncate">
                                    {formatCategoryDisplayName(selectedCategory.Name)}
                                  </h2>
                                  <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                    {filteredVideos.length} {filteredVideos.length === 1 ? 'clase' : 'clases'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                      {catWatched}/{catTotal} vistas · {catPercent}%
                                    </span>
                                    <div
                                      aria-hidden="true"
                                      className="hidden sm:block h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                                    >
                                      <div
                                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${catPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCategoryId(null)}
                                    className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                                  >
                                    Ver todas las categorías
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          <div
                            className={
                              viewMode === 'list'
                                ? 'flex flex-col gap-3'
                                : 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5'
                            }
                          >
                            {visibleVideos.map((video) => (
                              <VideoCard
                                key={video.IdVideo}
                                video={video}
                                isWatched={watchedIds.has(video.IdVideo)}
                                isFavorite={favoriteIds.has(video.IdVideo)}
                                viewMode={viewMode}
                                onWatch={markAsWatched}
                                onToggleWatched={handleToggleWatched}
                                onToggleFavorite={toggleFavorite}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lazy loading sentinel & fallback trigger */}
                      <div className="flex flex-col items-center justify-center gap-3 pt-2 pb-4">
                        {hasMore && (
                          <>
                            <div
                              ref={loadMoreSentinelRef}
                              aria-hidden="true"
                              className="h-2 w-full"
                            />
                            <button
                              type="button"
                              onClick={handleLoadMore}
                              data-testid="load-more-button"
                              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <span>
                                Cargar más clases ({filteredVideos.length - visibleVideos.length} restantes)
                              </span>
                            </button>
                          </>
                        )}
                        <p className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                          Mostrando {visibleVideos.length} de {filteredVideos.length} clases
                        </p>
                      </div>
                    </section>
                  )}
                </main>

                <aside className="w-full xl:w-76 shrink-0">
                  <div className="xl:sticky xl:top-20 space-y-5">
                    <StudyProgressWidget
                      watchedCount={watchedIds.size}
                      totalCount={allVideos.length}
                      watchedMinutes={watchedMinutes}
                      totalMinutes={totalCatalogMinutes}
                      categories={catalog.Categories}
                      categoryProgress={categoryProgress}
                      selectedCategoryId={selectedCategoryId}
                      onSelectCategory={setSelectedCategoryId}
                      onFilterWatched={() => setWatchedFilter('watched')}
                      onFilterUnwatched={() => setWatchedFilter('unwatched')}
                      onExportBackup={handleExportBackup}
                      onImportBackup={handleImportBackup}
                    />
                    <FavoritesPanel
                      favoriteOrder={favoriteOrder}
                      videoMap={videoMap}
                      isFilteringFavorites={watchedFilter === 'favorites'}
                      onFilterFavorites={handleToggleFilterFavorites}
                      onWatch={markAsWatched}
                      onRemoveFavorite={removeFavorite}
                      onClearFavorites={clearFavorites}
                    />
                    <RecentHistoryPanel
                      history={history}
                      videoMap={videoMap}
                      onWatch={markAsWatched}
                      onRemoveEntry={unmarkWatched}
                      onClearHistory={clearHistory}
                    />
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
