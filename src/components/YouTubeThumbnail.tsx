import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Code2, Film, ListVideo, Lock } from 'lucide-react';
import { ExternalResourceType, getYouTubeThumbnailCandidates } from '../utils/youtube';

interface YouTubeThumbnailProps {
  youtubeId: string | null;
  title: string;
  unavailable?: boolean;
  resourceType?: ExternalResourceType;
  className?: string;
  priority?: boolean;
}

export const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({
  youtubeId,
  title,
  unavailable = false,
  resourceType = 'youtube-video',
  className = '',
  priority = false,
}) => {
  const candidates = useMemo(
    () => (youtubeId ? getYouTubeThumbnailCandidates(youtubeId) : []),
    [youtubeId]
  );

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCandidateIndex(0);
    setLoaded(false);
  }, [youtubeId]);

  const currentSrc = candidates[candidateIndex] ?? null;
  const allFailed = !currentSrc || candidateIndex >= candidates.length;

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !currentSrc) return;
    if (img.complete && img.naturalWidth > 0) {
      if (img.naturalWidth <= 120 && candidateIndex < candidates.length - 1) {
        setLoaded(false);
        setCandidateIndex((prev) => prev + 1);
      } else if (img.naturalWidth <= 120 && unavailable) {
        setCandidateIndex(candidates.length);
      } else {
        setLoaded(true);
      }
    }
  }, [currentSrc, candidateIndex, candidates.length, unavailable]);

  const advanceCandidate = () => {
    setLoaded(false);
    setCandidateIndex((prev) => prev + 1);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= 120 && candidateIndex < candidates.length - 1) {
      advanceCandidate();
      return;
    }
    if (img.naturalWidth <= 120 && unavailable) {
      setCandidateIndex(candidates.length);
      return;
    }
    setLoaded(true);
  };

  if (allFailed) {
    return (
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 p-3 text-center ${className}`}
      >
        <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-300/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          {resourceType === 'youtube-playlist' ? (
            <ListVideo className="h-4 w-4 text-red-500" aria-hidden="true" />
          ) : resourceType === 'external' ? (
            <Code2 className="h-4 w-4 text-sky-500" aria-hidden="true" />
          ) : unavailable ? (
            <Lock className="h-4 w-4 text-red-500" aria-hidden="true" />
          ) : (
            <Film className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        <p className="line-clamp-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          {resourceType === 'youtube-playlist'
            ? 'Lista de reproducción'
            : resourceType === 'external'
              ? 'Script en TradingView'
              : unavailable
                ? 'Video no disponible'
                : title}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800/80"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={`Miniatura de ${title}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={advanceCandidate}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
