import { useCallback, useEffect, useMemo, useState } from 'react';
import { RoadmapState } from '../types/video';
import { DEFAULT_ROADMAP_STATE, loadRoadmapState, saveRoadmapState } from '../utils/storage';

export function useRoadmap() {
  const [roadmapState, setRoadmapState] = useState<RoadmapState>(() => loadRoadmapState());

  useEffect(() => {
    saveRoadmapState(roadmapState);
  }, [roadmapState]);

  const completedIdsSet = useMemo(
    () => new Set(roadmapState.completedIds),
    [roadmapState.completedIds]
  );

  const startRoadmap = useCallback(() => {
    setRoadmapState((prev) => ({
      ...prev,
      started: true,
      startedAt: prev.startedAt ?? Date.now(),
    }));
  }, []);

  const markStepCompleted = useCallback((videoId: number) => {
    setRoadmapState((prev) => {
      const alreadyDone = prev.completedIds.includes(videoId);
      return {
        started: true,
        startedAt: prev.startedAt ?? Date.now(),
        completedIds: alreadyDone ? prev.completedIds : [...prev.completedIds, videoId],
      };
    });
  }, []);

  const toggleStepCompleted = useCallback((videoId: number) => {
    setRoadmapState((prev) => {
      const exists = prev.completedIds.includes(videoId);
      return {
        started: true,
        startedAt: prev.startedAt ?? Date.now(),
        completedIds: exists
          ? prev.completedIds.filter((id) => id !== videoId)
          : [...prev.completedIds, videoId],
      };
    });
  }, []);

  const resetRoadmap = useCallback(() => {
    setRoadmapState({ ...DEFAULT_ROADMAP_STATE });
  }, []);

  const replaceRoadmap = useCallback((nextState: RoadmapState) => {
    setRoadmapState(nextState);
  }, []);

  return {
    roadmapState,
    completedIdsSet,
    startRoadmap,
    markStepCompleted,
    toggleStepCompleted,
    resetRoadmap,
    replaceRoadmap,
  };
}
