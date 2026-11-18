import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  EyeOff,
  Heart,
  Play,
} from 'lucide-react';
import { EnrichedVideo } from '../types/video';
import { formatDuration, formatViewCount, getResourceType } from '../utils/youtube';
import { YouTubeThumbnail } from './YouTubeThumbnail';
import { CatalogViewMode } from './SearchAndFilters';

interface VideoCardProps {
  video: EnrichedVideo;
  isWatched: boolean;
  isFavorite: boolean;
  viewMode?: CatalogViewMode;
  onWatch: (videoId: number) => void;
  onToggleWatched: (videoId: number) => void;
  onToggleFavorite: (videoId: number) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isWatched,
  isFavorite,
  viewMode = 'grid',
  onWatch,
  onToggleWatched,
  onToggleFavorite,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasDuration = video.Duration > 0;
  const hasChannel = video.Channel.trim().length > 0;
  const hasViews = video.Viewed > 0;
  const resourceType = getResourceType(video.Url);
  const badgeText = hasDuration
    ? formatDuration(video.Duration)
    : resourceType === 'youtube-playlist'
      ? 'Playlist'
      : resourceType === 'external'
        ? 'TradingView'
        : null;

  const ctaLabel = isWatched
    ? 'Ver de nuevo'
    : resourceType === 'youtube-playlist'
      ? 'Ver lista'
      : resourceType === 'external'
        ? 'Abrir recurso'
        : 'Ver en YouTube';

  if (viewMode === 'list') {
    return (
      <article
        data-testid={`video-card-${video.IdVideo}`}
        data-watched={isWatched ? 'true' : 'false'}
        data-favorite={isFavorite ? 'true' : 'false'}
        className={`group rounded-xl border bg-white dark:bg-zinc-900/40 p-3.5 sm:p-4 transition-colors ${
          isWatched
            ? 'border-emerald-500/40 dark:border-emerald-500/30'
            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <a
            href={video.Url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWatch(video.IdVideo)}
            aria-label={`Abrir "${video.Title}"`}
            className="relative block aspect-video w-full sm:w-48 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
          >
            <YouTubeThumbnail
              youtubeId={video.youtubeId}
              title={video.Title}
              resourceType={resourceType}
              className={`transition-all duration-300 group-hover:scale-[1.02] ${
                isWatched ? 'opacity-75 saturate-75 group-hover:opacity-100 group-hover:saturate-100' : ''
              }`}
            />
            {isWatched && (
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-emerald-950/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                <span>Visto</span>
              </div>
            )}
            {badgeText && (
              <div className="absolute bottom-2 right-2 rounded-md bg-zinc-950/85 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white tabular-nums">
                {badgeText}
              </div>
            )}
          </a>

          <div className="min-w-0 flex-1 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-mono text-[11px] tabular-nums">
                  #{String(video.IdVideo).padStart(2, '0')}
                </span>
                {hasChannel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{video.Channel}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{video.levelLabel}</span>
                {hasViews && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{formatViewCount(video.Viewed)}</span>
                  </>
                )}
              </div>

              <h3 className="mt-1 font-display text-base font-bold leading-snug">
                <a
                  href={video.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onWatch(video.IdVideo)}
                  className={`transition-colors rounded ${
                    isWatched
                      ? 'text-zinc-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300'
                      : 'text-zinc-950 dark:text-white hover:underline'
                  }`}
                >
                  {video.Title}
                </a>
              </h3>

              <p
                className={`mt-1 text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 ${
                  expanded ? '' : 'line-clamp-2'
                }`}
              >
                {video.Description}
              </p>

              {video.Description.length > 140 && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-expanded={expanded}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
                >
                  <span>{expanded ? 'Ver menos' : 'Leer resumen'}</span>
                  {expanded ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(video.IdVideo)}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `Quitar "${video.Title}" de favoritos`
                      : `Añadir "${video.Title}" a favoritos`
                  }
                  title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    isFavorite
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                  <span>{isFavorite ? 'En favoritos' : 'Favorito'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWatched(video.IdVideo)}
                  aria-label={
                    isWatched
                      ? `Quitar "${video.Title}" de vistos`
                      : `Marcar "${video.Title}" como visto`
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isWatched ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Desmarcar</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Marcar visto</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={video.Url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onWatch(video.IdVideo)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isWatched
                    ? 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200'
                }`}
              >
                <span>{ctaLabel}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-testid={`video-card-${video.IdVideo}`}
      data-watched={isWatched ? 'true' : 'false'}
      data-favorite={isFavorite ? 'true' : 'false'}
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white dark:bg-zinc-900/40 p-3.5 transition-colors ${
        isWatched
          ? 'border-emerald-500/40 dark:border-emerald-500/30'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div>
        <div className="relative">
          <a
            href={video.Url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWatch(video.IdVideo)}
            aria-label={`Abrir "${video.Title}"`}
            className="relative block aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
          >
            <YouTubeThumbnail
              youtubeId={video.youtubeId}
              title={video.Title}
              resourceType={resourceType}
              className={`transition-all duration-300 group-hover:scale-[1.02] ${
                isWatched ? 'opacity-75 saturate-75 group-hover:opacity-95 group-hover:saturate-100' : ''
              }`}
            />

            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25"
              aria-hidden="true"
            >
              <span className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-zinc-950/85 text-white shadow-md opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                <Play className="h-4 w-4 fill-current translate-x-0.5" />
              </span>
            </div>

            {isWatched && (
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-emerald-950/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                <span>Visto</span>
              </div>
            )}

            {badgeText && (
              <div className="absolute bottom-2 right-2 rounded-md bg-zinc-950/85 px-2 py-0.5 font-mono text-xs font-medium text-white tabular-nums">
                {badgeText}
              </div>
            )}
          </a>

          <button
            type="button"
            onClick={() => onToggleFavorite(video.IdVideo)}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Quitar "${video.Title}" de favoritos`
                : `Añadir "${video.Title}" a favoritos`
            }
            title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md border backdrop-blur-xs transition-colors cursor-pointer ${
              isFavorite
                ? 'border-rose-400/60 bg-rose-950/85 text-rose-400'
                : 'border-white/15 bg-zinc-950/65 text-zinc-200 hover:bg-zinc-950/90 hover:text-rose-400'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="pt-3 pb-2">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-mono text-[11px] tabular-nums">
              #{String(video.IdVideo).padStart(2, '0')}
            </span>
            {hasChannel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{video.Channel}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{video.levelLabel}</span>
            {hasViews && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{formatViewCount(video.Viewed)}</span>
              </>
            )}
          </div>

          <h3 className="mt-1.5 font-display text-[15px] sm:text-base font-bold leading-snug tracking-tight">
            <a
              href={video.Url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onWatch(video.IdVideo)}
              className={`transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 rounded ${
                isWatched
                  ? 'text-zinc-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300'
                  : 'text-zinc-950 dark:text-white hover:underline'
              }`}
            >
              {video.Title}
            </a>
          </h3>

          <p
            className={`mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {video.Description}
          </p>

          {video.Description.length > 110 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
            >
              <span>{expanded ? 'Ver menos' : 'Leer resumen'}</span>
              {expanded ? (
                <ChevronUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-3 flex items-center justify-between gap-2">
        <a
          href={video.Url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onWatch(video.IdVideo)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 ${
            isWatched
              ? 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200'
          }`}
        >
          <span>{ctaLabel}</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={() => onToggleWatched(video.IdVideo)}
          aria-label={
            isWatched
              ? `Quitar "${video.Title}" de vistos`
              : `Marcar "${video.Title}" como visto`
          }
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isWatched ? (
            <>
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Desmarcar</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Marcar visto</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
