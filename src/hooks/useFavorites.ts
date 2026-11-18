import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadFavorites,
  removeFavoriteFromList,
  saveFavorites,
  toggleFavoriteInList,
} from '../utils/storage';

export function useFavorites() {
  const [favoriteOrder, setFavoriteOrder] = useState<number[]>(() => loadFavorites());

  useEffect(() => {
    saveFavorites(favoriteOrder);
  }, [favoriteOrder]);

  const favoriteIds = useMemo(() => new Set(favoriteOrder), [favoriteOrder]);

  const toggleFavorite = useCallback((videoId: number) => {
    setFavoriteOrder((prev) => toggleFavoriteInList(prev, videoId));
  }, []);

  const removeFavorite = useCallback((videoId: number) => {
    setFavoriteOrder((prev) => removeFavoriteFromList(prev, videoId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteOrder([]);
  }, []);

  const replaceFavorites = useCallback((ids: number[]) => {
    setFavoriteOrder(ids);
  }, []);

  return {
    favoriteOrder,
    favoriteIds,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    replaceFavorites,
  };
}
