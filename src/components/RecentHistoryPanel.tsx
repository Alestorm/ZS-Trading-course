import React from 'react';
import { History, Trash2, X } from 'lucide-react';
import { EnrichedVideo, WatchHistoryEntry } from '../types/video';
import { formatDuration, getResourceType } from '../utils/youtube';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface RecentHistoryPanelProps {
  history: WatchHistoryEntry[];
  videoMap: Map<number, EnrichedVideo>;
  onWatch: (videoId: number) => void;
  onRemoveEntry: (videoId: number) => void;
  onClearHistory: () => void;
}

function formatWatchedTime(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
}

export const RecentHistoryPanel: React.FC<RecentHistoryPanelProps> = ({
  history,
  videoMap,
  onWatch,
  onRemoveEntry,
  onClearHistory,
}) => {
  const entries = history
    .map((entry) => ({
      ...entry,
      video: videoMap.get(entry.videoId),
    }))
    .filter((item): item is { videoId: number; watchedAt: number; video: EnrichedVideo } =>
      Boolean(item.video)
    );

  return (
    <section
      aria-label="Vistos recientemente"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5"
    >
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
            Vistos recientemente
          </h2>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="Limpiar historial de videos vistos"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="mt-4 py-4 text-center">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Aún no has abierto ningún video.
          </p>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Al hacer clic en cualquier enlace de YouTube se guardará aquí automáticamente.
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
          {entries.slice(0, 8).map(({ video, watchedAt }) => (
            <li
              key={video.IdVideo}
              className="group flex items-center gap-2.5 rounded-lg p-1.5 -mx-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <a
                href={video.Url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onWatch(video.IdVideo)}
                aria-label={`Abrir de nuevo ${video.Title}`}
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
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                  {video.Duration > 0 && (
                    <>
                      <span>{formatDuration(video.Duration)}</span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span className="truncate font-sans">{formatWatchedTime(watchedAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveEntry(video.IdVideo)}
                aria-label={`Quitar "${video.Title}" del historial`}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md p-1 text-zinc-400 hover:text-red-500 transition-opacity cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
