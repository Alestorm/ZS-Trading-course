import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Heart,
  LayoutGrid,
  Layers,
  RotateCcw,
  Tv,
  X,
} from 'lucide-react';
import {
  AppSection,
  Category,
  CategoryProgress,
  ThemeMode,
  WatchedFilter,
} from '../types/video';
import { LEVEL_LABELS, formatCategoryDisplayName } from '../data/catalog';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

interface SidebarNavProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  roadmapStarted: boolean;
  roadmapCompletedCount: number;
  roadmapTotalCount: number;
  categories: Category[];
  categoryCounts: Map<number, number>;
  categoryProgress: Map<number, CategoryProgress>;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  selectedLevelId: number | null;
  onSelectLevel: (levelId: number | null) => void;
  channels: string[];
  selectedChannel: string | null;
  onSelectChannel: (channel: string | null) => void;
  watchedFilter: WatchedFilter;
  onSelectWatchedFilter: (filter: WatchedFilter) => void;
  watchedCount: number;
  favoritesCount: number;
  totalCount: number;
  onResetAll: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  onSelectSection,
  roadmapStarted,
  roadmapCompletedCount,
  roadmapTotalCount,
  categories,
  categoryCounts,
  categoryProgress,
  selectedCategoryId,
  onSelectCategory,
  selectedLevelId,
  onSelectLevel,
  channels,
  selectedChannel,
  onSelectChannel,
  watchedFilter,
  onSelectWatchedFilter,
  watchedCount,
  favoritesCount,
  totalCount,
  onResetAll,
  theme,
  onToggleTheme,
  mobileOpen,
  onCloseMobile,
}) => {
  const isHomeActive =
    activeSection === 'catalog' &&
    watchedFilter === 'all' &&
    selectedCategoryId === null &&
    selectedLevelId === null &&
    selectedChannel === null;

  const primaryItems = [
    {
      id: 'home',
      label: 'Explorar todo',
      count: totalCount,
      icon: LayoutGrid,
      active: isHomeActive,
      onClick: () => {
        onSelectSection('catalog');
        onResetAll();
      },
    },
    {
      id: 'unwatched',
      label: 'Pendientes',
      count: Math.max(0, totalCount - watchedCount),
      icon: Clock,
      active: activeSection === 'catalog' && watchedFilter === 'unwatched',
      onClick: () => {
        onSelectSection('catalog');
        onSelectWatchedFilter(watchedFilter === 'unwatched' ? 'all' : 'unwatched');
      },
    },
    {
      id: 'watched',
      label: 'Vistos',
      count: watchedCount,
      icon: CheckCircle2,
      active: activeSection === 'catalog' && watchedFilter === 'watched',
      onClick: () => {
        onSelectSection('catalog');
        onSelectWatchedFilter(watchedFilter === 'watched' ? 'all' : 'watched');
      },
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      count: favoritesCount,
      icon: Heart,
      active: activeSection === 'catalog' && watchedFilter === 'favorites',
      onClick: () => {
        onSelectSection('catalog');
        onSelectWatchedFilter(watchedFilter === 'favorites' ? 'all' : 'favorites');
      },
    },
  ];

  const renderNavContent = (onAfterSelect?: () => void) => (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-5">
        {/* Secciones principales */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Secciones
          </p>
          <nav aria-label="Secciones de la aplicación" className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectSection('catalog');
                onAfterSelect?.();
              }}
              aria-pressed={activeSection === 'catalog'}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeSection === 'catalog'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Videoteca</span>
              </span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  activeSection === 'catalog' ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectSection('roadmap');
                onAfterSelect?.();
              }}
              aria-pressed={activeSection === 'roadmap'}
              data-testid="sidebar-roadmap-button"
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeSection === 'roadmap'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Compass
                  className={`h-4 w-4 shrink-0 ${
                    activeSection === 'roadmap' ? '' : 'text-red-600 dark:text-red-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">Roadmap</span>
              </span>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  activeSection === 'roadmap' ? 'opacity-85' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {roadmapStarted ? `${roadmapCompletedCount}/${roadmapTotalCount}` : 'Empezar'}
              </span>
            </button>

            <a
              href="https://sessions-zs-time-zones.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onAfterSelect?.()}
              data-testid="sidebar-sessions-link"
              title="Abrir reloj de sesiones de trading y zonas horarias"
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Clock className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="truncate">Sesiones de Mercado</span>
              </span>
              <ExternalLink
                className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500"
                aria-hidden="true"
              />
            </a>
          </nav>
        </div>

        {/* Biblioteca */}
        <div className="space-y-1 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <p className="px-3 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Biblioteca
          </p>
          <nav aria-label="Navegación de biblioteca" className="space-y-1">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    onAfterSelect?.();
                  }}
                  aria-pressed={item.active}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        item.id === 'favorites' && !item.active ? 'text-rose-500' : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      item.active ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categorías */}
        <div className="space-y-1 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Categorías
            </p>
            {selectedCategoryId !== null && (
              <button
                type="button"
                onClick={() => {
                  onSelectSection('catalog');
                  onSelectCategory(null);
                  onAfterSelect?.();
                }}
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                Todas
              </button>
            )}
          </div>
          <nav aria-label="Categorías del curso" className="space-y-1">
            {categories.map((category) => {
              const active = activeSection === 'catalog' && selectedCategoryId === category.IdCategory;
              const count = categoryCounts.get(category.IdCategory) ?? 0;
              const progress = categoryProgress.get(category.IdCategory);
              const watched = progress?.watched ?? 0;
              const percent = progress?.percent ?? 0;
              const label = formatCategoryDisplayName(category.Name);
              return (
                <button
                  key={category.IdCategory}
                  type="button"
                  onClick={() => {
                    onSelectSection('catalog');
                    onSelectCategory(active ? null : category.IdCategory);
                    onAfterSelect?.();
                  }}
                  aria-pressed={active}
                  title={`${label} (${watched}/${count} vistas)`}
                  className={`flex w-full flex-col gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
                      <span className="truncate text-left">{label}</span>
                    </span>
                    <span
                      className={`font-mono text-[11px] tabular-nums shrink-0 ${
                        active ? 'opacity-85' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {watched}/{count}
                    </span>
                  </div>
                  <div
                    aria-hidden="true"
                    className={`h-1 w-full overflow-hidden rounded-full ${
                      active ? 'bg-white/20 dark:bg-zinc-950/20' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        active
                          ? 'bg-emerald-400 dark:bg-emerald-600'
                          : 'bg-emerald-600 dark:bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Nivel */}
        <div className="space-y-1 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <p className="px-3 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Nivel
          </p>
          {[1, 2, 3].map((lvlId) => {
            const active = activeSection === 'catalog' && selectedLevelId === lvlId;
            const Icon = lvlId === 3 ? Layers : GraduationCap;
            return (
              <button
                key={lvlId}
                type="button"
                onClick={() => {
                  onSelectSection('catalog');
                  onSelectLevel(active ? null : lvlId);
                  onAfterSelect?.();
                }}
                aria-pressed={active}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{LEVEL_LABELS[lvlId]}</span>
              </button>
            );
          })}
        </div>

        {/* Canales */}
        {channels.length > 0 && (
          <div className="space-y-1 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <p className="px-3 pb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Canales
            </p>
            {channels.map((channel) => {
              const active = activeSection === 'catalog' && selectedChannel === channel;
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => {
                    onSelectSection('catalog');
                    onSelectChannel(active ? null : channel);
                    onAfterSelect?.();
                  }}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Tv className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{channel}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeSection === 'catalog' && !isHomeActive && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onResetAll();
                onAfterSelect?.();
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restablecer filtros</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Clean Minimalist Tailwind Sidebar */}
      <aside
        aria-label="Navegación lateral"
        className="hidden lg:block w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      >
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-5">
          {renderNavContent()}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            aria-label="Menú de navegación móvil"
            className="relative z-10 w-76 max-w-[85vw] h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <BrandLogo />
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label="Cerrar menú lateral"
                  className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {renderNavContent(onCloseMobile)}
            </div>

            <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
