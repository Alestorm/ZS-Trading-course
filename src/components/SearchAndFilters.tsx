import React, { useState } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Category, SortOption, WatchedFilter } from '../types/video';
import { LEVEL_LABELS, formatCategoryDisplayName } from '../data/catalog';

export type CatalogViewMode = 'grid' | 'list';

interface SearchAndFiltersProps {
  categories: Category[];
  categoryCounts: Map<number, number>;
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  selectedLevelId: number | null;
  onLevelChange: (levelId: number | null) => void;
  channels: string[];
  selectedChannel: string | null;
  onChannelChange: (channel: string | null) => void;
  watchedFilter: WatchedFilter;
  onWatchedFilterChange: (filter: WatchedFilter) => void;
  favoritesCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalMatching: number;
  totalVideos: number;
  hasDurationData?: boolean;
  hasViewData?: boolean;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  categories,
  categoryCounts,
  selectedCategoryId,
  onCategoryChange,
  selectedLevelId,
  onLevelChange,
  channels,
  selectedChannel,
  onChannelChange,
  watchedFilter,
  onWatchedFilterChange,
  favoritesCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onResetFilters,
  totalMatching,
  totalVideos,
  hasDurationData = true,
  hasViewData = true,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const extraFilterCount =
    (selectedLevelId !== null ? 1 : 0) +
    (selectedChannel !== null ? 1 : 0) +
    (selectedCategoryId !== null ? 1 : 0) +
    (sortBy !== 'order' ? 1 : 0);

  return (
    <section aria-label="Filtros del catálogo" className="space-y-3">
      {/* Category Division Strip */}
      {categories.length > 0 && (
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            aria-pressed={selectedCategoryId === null}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategoryId === null
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span>Todas las categorías</span>
            <span className="font-mono text-[11px] opacity-75 tabular-nums">{totalVideos}</span>
          </button>

          {categories.map((cat) => {
            const active = selectedCategoryId === cat.IdCategory;
            const count = categoryCounts.get(cat.IdCategory) ?? 0;
            return (
              <button
                key={cat.IdCategory}
                type="button"
                onClick={() => onCategoryChange(active ? null : cat.IdCategory)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <span>{formatCategoryDisplayName(cat.Name)}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Status Tabs + Collapsible Filters + View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Estado de visualización"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/80 dark:border-zinc-800"
        >
          {(
            [
              { id: 'all', label: `Todas (${totalVideos})` },
              { id: 'unwatched', label: 'Pendientes' },
              { id: 'watched', label: 'Vistos' },
              { id: 'favorites', label: `Favoritos (${favoritesCount})` },
            ] as const
          ).map((item) => {
            const active = watchedFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onWatchedFilterChange(item.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                {item.id === 'favorites' && (
                  <Heart
                    className={`h-3 w-3 ${
                      active ? 'text-rose-500 fill-current' : 'text-rose-500'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMoreFilters((prev) => !prev)}
            aria-expanded={showMoreFilters}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showMoreFilters || extraFilterCount > 0
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Filtros{extraFilterCount > 0 ? ` (${extraFilterCount})` : ''}
            </span>
          </button>

          <div
            role="group"
            aria-label="Modo de visualización"
            className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 gap-0.5"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Cuadrícula"
              title="Vista en cuadrícula"
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="Lista"
              title="Vista en lista"
              className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Secondary Filters */}
      {showMoreFilters && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por nivel">
            <button
              type="button"
              onClick={() => onLevelChange(null)}
              aria-pressed={selectedLevelId === null}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedLevelId === null
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Todos los niveles
            </button>
            {[1, 2, 3].map((lvlId) => (
              <button
                key={lvlId}
                type="button"
                onClick={() => onLevelChange(selectedLevelId === lvlId ? null : lvlId)}
                aria-pressed={selectedLevelId === lvlId}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedLevelId === lvlId
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                    : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {LEVEL_LABELS[lvlId]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {channels.length > 0 && (
              <select
                aria-label="Filtrar por canal"
                value={selectedChannel ?? ''}
                onChange={(e) => onChannelChange(e.target.value || null)}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 cursor-pointer"
              >
                <option value="">Todos los canales</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            )}

            <select
              aria-label="Ordenar videos"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 cursor-pointer"
            >
              <option value="order">Orden de ruta</option>
              {hasViewData && <option value="views-desc">Más vistos</option>}
              {hasDurationData && <option value="duration-asc">Menor duración</option>}
              {hasDurationData && <option value="duration-desc">Mayor duración</option>}
              <option value="title-asc">Título (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {(hasActiveFilters || totalMatching !== totalVideos) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
          <span>
            Mostrando{' '}
            <strong className="font-mono font-semibold text-zinc-950 dark:text-white tabular-nums">
              {totalMatching}
            </strong>{' '}
            de <span className="font-mono tabular-nums">{totalVideos}</span> clases
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200 hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
