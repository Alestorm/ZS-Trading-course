import { useCallback, useEffect, useMemo, useState } from 'react';
import { WatchHistoryEntry } from '../types/video';
import {
  addVideoToHistoryList,
  loadWatchHistory,
  removeVideoFromHistoryList,
  saveWatchHistory,
} from '../utils/storage';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryEntry[]>(() => loadWatchHistory());

  useEffect(() => {
    saveWatchHistory(history);
  }, [history]);

  const watchedIds = useMemo(
    () => new Set(history.map((entry) => entry.videoId)),
    [history]
  );

  const markAsWatched = useCallback((videoId: number) => {
    setHistory((prev) => addVideoToHistoryList(prev, videoId, Date.now()));
  }, []);

  const unmarkWatched = useCallback((videoId: number) => {
    setHistory((prev) => removeVideoFromHistoryList(prev, videoId));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const replaceHistory = useCallback((entries: WatchHistoryEntry[]) => {
    setHistory(entries);
  }, []);

  return {
    history,
    watchedIds,
    markAsWatched,
    unmarkWatched,
    clearHistory,
    replaceHistory,
  };
}
