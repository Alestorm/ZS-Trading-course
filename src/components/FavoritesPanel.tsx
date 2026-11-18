import React from 'react';
import { ArrowRight, Heart, Trash2, X } from 'lucide-react';
import { EnrichedVideo } from '../types/video';
import { formatCategoryDisplayName } from '../data/catalog';
import { formatDuration, getResourceType } from '../utils/youtube';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface FavoritesPanelProps {
  favoriteOrder: number[];
  videoMap: Map<number, EnrichedVideo>;
  isFilteringFavorites: boolean;
  onFilterFavorites: () => void;
  onWatch: (videoId: number) => void;
  onRemoveFavorite: (videoId: number) => void;
  onClearFavorites: () => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  favoriteOrder,
  videoMap,
  isFilteringFavorites,
  onFilterFavorites,
  onWatch,
  onRemoveFavorite,
  onClearFavorites,
}) => {
  const entries = favoriteOrder
    .map((id) => videoMap.get(id))
    .filter((video): video is EnrichedVideo => Boolean(video));

  return (
    <section
      aria-label="Tus clases favoritas"
      data-testid="favorites-panel"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-3.5"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </span>
          <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
            Favoritos
          </h2>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            ({entries.length})
          </span>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearFavorites}
            aria-label="Vaciar lista de favoritos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-3 text-center">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Tu colección personal está vacía.
          </p>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Pulsa el corazón en cualquier clase para guardarla aquí y repasarla cuando quieras.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
            {entries.slice(0, 6).map((video) => (
              <li
                key={video.IdVideo}
                className="group flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <a
                  href={video.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onWatch(video.IdVideo)}
                  aria-label={`Abrir favorito ${video.Title}`}
                  className="relative h-11 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800"
                >
                  <YouTubeThumbnail
                    youtubeId={video.youtubeId}
                    title={video.Title}
                    resourceType={getResourceType(video.Url)}
                  />
                </a>

                <div className="min-w-0 flex-1">
                  <a
                    href={video.Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onWatch(video.IdVideo)}
                    className="line-clamp-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline transition-colors"
                  >
                    {video.Title}
                  </a>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="truncate">{formatCategoryDisplayName(video.categoryName)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums shrink-0">
                      {video.Duration > 0 ? formatDuration(video.Duration) : video.levelLabel}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(video.IdVideo)}
                  aria-label={`Quitar "${video.Title}" de favoritos`}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 rounded-md p-1 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onFilterFavorites}
            aria-pressed={isFilteringFavorites}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              isFilteringFavorites
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>
              {isFilteringFavorites ? 'Viendo favoritos' : `Ver todos (${entries.length})`}
            </span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
};
