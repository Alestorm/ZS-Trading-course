import React from 'react';
import { CheckCircle2, ExternalLink, Heart, Play } from 'lucide-react';
import { EnrichedVideo } from '../types/video';
import { formatDuration, formatViewCount, getResourceType } from '../utils/youtube';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface FeaturedVideoBannerProps {
  video: EnrichedVideo;
  isLastWatched: boolean;
  isWatched: boolean;
  isFavorite: boolean;
  queueVideos: EnrichedVideo[];
  watchedIds: ReadonlySet<number>;
  onWatch: (videoId: number) => void;
  onToggleFavorite: (videoId: number) => void;
}

export const FeaturedVideoBanner: React.FC<FeaturedVideoBannerProps> = ({
  video,
  isLastWatched,
  isWatched,
  isFavorite,
  queueVideos,
  watchedIds,
  onWatch,
  onToggleFavorite,
}) => {
  return (
    <section
      aria-label={isLastWatched ? 'Último video visto y ruta siguiente' : 'Clase destacada y ruta siguiente'}
      data-testid="featured-banner"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Next in Route Queue */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="font-display text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              En tu ruta ({queueVideos.length})
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Acceso directo
            </span>
          </div>

          <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {queueVideos.map((item) => {
              const itemWatched = watchedIds.has(item.IdVideo);
              return (
                <li key={item.IdVideo}>
                  <a
                    href={item.Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onWatch(item.IdVideo)}
                    className="group flex items-center gap-3 rounded-lg py-2 px-1.5 -mx-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
                      <YouTubeThumbnail
                        youtubeId={item.youtubeId}
                        title={item.Title}
                        resourceType={getResourceType(item.Url)}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                        {item.Title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-mono tabular-nums">
                          #{String(item.IdVideo).padStart(2, '0')}
                        </span>
                        {item.Channel.trim() && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.Channel}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{item.levelLabel}</span>
                        {item.Duration > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {formatDuration(item.Duration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {itemWatched && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-label="Visto"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Featured / Recommended Class */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-3">
          <a
            href={video.Url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWatch(video.IdVideo)}
            aria-label={`Ver "${video.Title}" en YouTube`}
            className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
          >
            <YouTubeThumbnail
              youtubeId={video.youtubeId}
              title={video.Title}
              priority
              resourceType={getResourceType(video.Url)}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />

            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25"
              aria-hidden="true"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950/85 text-white shadow-md opacity-90 transition-transform duration-200 group-hover:scale-105 group-hover:opacity-100">
                <Play className="h-5 w-5 fill-current translate-x-0.5" />
              </span>
            </div>

            {isLastWatched && (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-emerald-950/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span>Último visto</span>
              </span>
            )}

            {video.Duration > 0 && (
              <span className="absolute bottom-2.5 right-2.5 rounded-md bg-zinc-950/85 px-2 py-0.5 font-mono text-xs font-medium text-white tabular-nums">
                {formatDuration(video.Duration)}
              </span>
            )}
          </a>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {isLastWatched ? 'Último video visto' : 'Clase destacada'} ·{' '}
                <span className="font-mono tabular-nums">
                  #{String(video.IdVideo).padStart(2, '0')}
                </span>
                {video.Channel.trim() ? ` · ${video.Channel}` : ''} · {video.levelLabel}
                {video.Viewed > 0 && (
                  <>
                    {' '}· <span className="font-mono tabular-nums">{formatViewCount(video.Viewed)}</span>
                  </>
                )}
              </p>
              <h2 className="mt-1 font-display text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-white line-clamp-2">
                {video.Title}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-end">
              <button
                type="button"
                onClick={() => onToggleFavorite(video.IdVideo)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                className={`inline-flex items-center justify-center rounded-lg border p-2 transition-colors cursor-pointer ${
                  isFavorite
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>

              <a
                href={video.Url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onWatch(video.IdVideo)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span>{isWatched ? 'Ver de nuevo' : 'Ver clase'}</span>
                <ExternalLink className="h-3 w-3 opacity-80" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
