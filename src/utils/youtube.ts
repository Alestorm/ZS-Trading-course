export type ThumbnailQuality = 'maxres' | 'sd' | 'hq';
export type ExternalResourceType = 'youtube-video' | 'youtube-playlist' | 'external';

const QUALITY_FILENAME: Record<ThumbnailQuality, string> = {
  maxres: 'maxresdefault.jpg',
  sd: 'sddefault.jpg',
  hq: 'hqdefault.jpg',
};

/**
 * Extracts the YouTube video ID from standard watch, short, embed, shorts, or live URLs.
 */
export function extractYouTubeId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{6,15}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{6,15}$/.test(vParam)) {
        return vParam;
      }

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (
        segments.length >= 2 &&
        (segments[0] === 'embed' ||
          segments[0] === 'shorts' ||
          segments[0] === 'v' ||
          segments[0] === 'live')
      ) {
        const id = segments[1];
        return id && /^[a-zA-Z0-9_-]{6,15}$/.test(id) ? id : null;
      }
    }
  } catch {
    const match = rawUrl.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{6,15})/);
    return match?.[1] ?? null;
  }

  return null;
}

export function getResourceType(rawUrl: string): ExternalResourceType {
  if (extractYouTubeId(rawUrl)) return 'youtube-video';
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (
      (host === 'youtube.com' || host === 'm.youtube.com') &&
      (parsed.pathname.includes('playlist') || parsed.searchParams.has('list'))
    ) {
      return 'youtube-playlist';
    }
  } catch {
    // Fallback
  }
  return 'external';
}

/**
 * Returns ordered YouTube thumbnail URLs from highest quality (og:image equivalent) to reliable fallback.
 */
export function getYouTubeThumbnailCandidates(videoId: string): string[] {
  return [
    `https://i.ytimg.com/vi/${videoId}/${QUALITY_FILENAME.maxres}`,
    `https://i.ytimg.com/vi/${videoId}/${QUALITY_FILENAME.sd}`,
    `https://i.ytimg.com/vi/${videoId}/${QUALITY_FILENAME.hq}`,
  ];
}

export function getYouTubeThumbnailUrl(
  url: string,
  quality: ThumbnailQuality = 'maxres'
): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/${QUALITY_FILENAME[quality]}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'No disponible';
  }
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function formatViewCount(views: number): string {
  if (!Number.isFinite(views) || views <= 0) {
    return 'Sin vistas';
  }
  return `${new Intl.NumberFormat('es-ES').format(views)} vistas`;
}
