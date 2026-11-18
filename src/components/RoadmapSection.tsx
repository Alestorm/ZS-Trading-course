import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  Heart,
  Play,
  RotateCcw,
} from 'lucide-react';
import { EnrichedVideo, RoadmapState } from '../types/video';
import { buildRoadmapStages } from '../data/roadmap';
import { formatDuration, getResourceType } from '../utils/youtube';
import { YouTubeThumbnail } from './YouTubeThumbnail';

interface RoadmapSectionProps {
  videos: EnrichedVideo[];
  roadmapState: RoadmapState;
  completedIdsSet: ReadonlySet<number>;
  favoriteIds: ReadonlySet<number>;
  onStartRoadmap: () => void;
  onToggleStepCompleted: (videoId: number) => void;
  onMarkStepCompleted: (videoId: number) => void;
  onResetRoadmap: () => void;
  onToggleFavorite: (videoId: number) => void;
  onBackToCatalog: () => void;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  videos,
  roadmapState,
  completedIdsSet,
  favoriteIds,
  onStartRoadmap,
  onToggleStepCompleted,
  onMarkStepCompleted,
  onResetRoadmap,
  onToggleFavorite,
  onBackToCatalog,
}) => {
  const stages = useMemo(() => buildRoadmapStages(videos), [videos]);
  const totalLessons = useMemo(
    () => stages.reduce((acc, stage) => acc + stage.videos.length, 0),
    [stages]
  );
  const totalHours = useMemo(() => {
    const totalMinutes = Math.round(
      videos.reduce((acc, v) => acc + v.Duration, 0) / 60
    );
    return Math.round(totalMinutes / 60);
  }, [videos]);

  const completedCount = useMemo(() => {
    let count = 0;
    for (const stage of stages) {
      for (const v of stage.videos) {
        if (completedIdsSet.has(v.IdVideo)) count++;
      }
    }
    return count;
  }, [stages, completedIdsSet]);

  const overallPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const nextRecommended = useMemo(() => {
    for (const stage of stages) {
      for (let i = 0; i < stage.videos.length; i++) {
        const video = stage.videos[i];
        if (!completedIdsSet.has(video.IdVideo)) {
          return { stage, stepIndex: i + 1, video };
        }
      }
    }
    return null;
  }, [stages, completedIdsSet]);

  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (!roadmapState.started) {
      setExpandedStageId(null);
      setConfirmingReset(false);
      return;
    }
    setExpandedStageId((prev) => {
      if (prev && stages.some((s) => s.id === prev)) return prev;
      return nextRecommended?.stage.id ?? stages[0]?.id ?? null;
    });
  }, [roadmapState.started, stages, nextRecommended]);

  if (!roadmapState.started) {
    return (
      <section
        aria-label="Presentación del Roadmap de Estudio"
        data-testid="roadmap-intro"
        className="space-y-6"
      >
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Compass className="h-3.5 w-3.5 text-red-600 dark:text-red-500" aria-hidden="true" />
                <span>Ruta guiada independiente</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Aprende trading en orden progresivo desde cero
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Este roadmap organiza las {totalLessons} clases en {stages.length} etapas secuenciales
                (de Básico a Avanzado). Tu progreso aquí comienza en 0% y no se mezcla con lo que ya
                viste en la Videoteca, aunque sí comparte tu lista de Favoritos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onStartRoadmap}
                data-testid="start-roadmap-button"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Empezar Roadmap</span>
              </button>

              <button
                type="button"
                onClick={onBackToCatalog}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Volver a Videoteca</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Etapas</p>
              <p className="mt-0.5 font-mono text-base font-bold text-zinc-950 dark:text-white tabular-nums">
                {stages.length}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Clases ordenadas</p>
              <p className="mt-0.5 font-mono text-base font-bold text-zinc-950 dark:text-white tabular-nums">
                {totalLessons}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Duración total</p>
              <p className="mt-0.5 font-mono text-base font-bold text-zinc-950 dark:text-white tabular-nums">
                ~{totalHours} h
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                    ETAPA {String(stage.stepNumber).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {stage.levelSummary}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-zinc-950 dark:text-white">
                  {stage.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {stage.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-mono tabular-nums">
                  {stage.videos.length} {stage.videos.length === 1 ? 'clase' : 'clases'}
                </span>
                <span>Ordenado por nivel</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Roadmap de Estudio activo"
      data-testid="roadmap-active"
      className="space-y-6"
    >
      {/* Overall Roadmap Progress Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Compass className="h-3.5 w-3.5 text-red-600 dark:text-red-500" aria-hidden="true" />
              <span>Progreso propio del Roadmap (independiente de la Videoteca)</span>
            </div>
            <p className="font-mono text-sm font-semibold text-zinc-950 dark:text-white tabular-nums">
              {completedCount}/{totalLessons} clases completadas · {overallPercent}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            {confirmingReset ? (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-2.5 py-1">
                <span className="text-[11px] font-medium text-red-700 dark:text-red-300">
                  ¿Reiniciar a 0%?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetRoadmap();
                    setConfirmingReset(false);
                  }}
                  data-testid="confirm-reset-roadmap"
                  className="rounded px-2 py-0.5 text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                data-testid="reset-roadmap-button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reiniciar roadmap</span>
              </button>
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div
            className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Next Recommended Lesson Highlight */}
      {nextRecommended ? (
        <div
          data-testid="roadmap-next-step"
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href={nextRecommended.video.Url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onMarkStepCompleted(nextRecommended.video.IdVideo)}
              aria-label={`Abrir siguiente paso "${nextRecommended.video.Title}"`}
              className="relative block aspect-video w-full sm:w-52 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800"
            >
              <YouTubeThumbnail
                youtubeId={nextRecommended.video.youtubeId}
                title={nextRecommended.video.Title}
                resourceType={getResourceType(nextRecommended.video.Url)}
                priority
              />
              {nextRecommended.video.Duration > 0 && (
                <span className="absolute bottom-2 right-2 rounded-md bg-zinc-950/85 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white tabular-nums">
                  {formatDuration(nextRecommended.video.Duration)}
                </span>
              )}
            </a>

            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Siguiente paso recomendado
                </span>
                <span className="font-mono text-[11px]">
                  Etapa {nextRecommended.stage.stepNumber} · Paso {nextRecommended.stepIndex}
                </span>
                <span aria-hidden="true">·</span>
                <span>{nextRecommended.video.levelLabel}</span>
              </div>

              <h2 className="font-display text-base sm:text-lg font-bold text-zinc-950 dark:text-white leading-snug">
                {nextRecommended.video.Title}
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {nextRecommended.video.Description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={nextRecommended.video.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onMarkStepCompleted(nextRecommended.video.IdVideo)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                >
                  <span>Ver clase</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onToggleStepCompleted(nextRecommended.video.IdVideo)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Marcar completado</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(nextRecommended.video.IdVideo)}
                  aria-pressed={favoriteIds.has(nextRecommended.video.IdVideo)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    favoriteIds.has(nextRecommended.video.IdVideo)
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-500'
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      favoriteIds.has(nextRecommended.video.IdVideo) ? 'fill-current' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {favoriteIds.has(nextRecommended.video.IdVideo) ? 'En favoritos' : 'Favorito'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                ¡Roadmap completado al 100%!
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Completaste las {totalLessons} clases de la ruta formativa. Puedes repasar tus Favoritos o reiniciar el camino cuando desees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6 Stages Accordion */}
      <div className="space-y-3">
        {stages.map((stage) => {
          const stageCompleted = stage.videos.filter((v) =>
            completedIdsSet.has(v.IdVideo)
          ).length;
          const stagePercent =
            stage.videos.length > 0
              ? Math.round((stageCompleted / stage.videos.length) * 100)
              : 0;
          const isExpanded = expandedStageId === stage.id;
          const stageDone = stageCompleted === stage.videos.length && stage.videos.length > 0;

          return (
            <div
              key={stage.id}
              data-testid={`roadmap-stage-${stage.stepNumber}`}
              className={`rounded-xl border bg-white dark:bg-zinc-900/40 overflow-hidden transition-colors ${
                stageDone
                  ? 'border-emerald-500/35'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedStageId((prev) => (prev === stage.id ? null : stage.id))
                }
                aria-expanded={isExpanded}
                className="w-full p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                      stageDone
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {String(stage.stepNumber).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                        {stage.title}
                      </h3>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        · {stage.levelSummary}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                      {stage.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {stageCompleted}/{stage.videos.length} · {stagePercent}%
                    </p>
                    <div
                      aria-hidden="true"
                      className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                    >
                      <div
                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                        style={{ width: `${stagePercent}%` }}
                      />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                  {stage.videos.map((video, index) => {
                    const isCompleted = completedIdsSet.has(video.IdVideo);
                    const isFavorite = favoriteIds.has(video.IdVideo);
                    const resourceType = getResourceType(video.Url);
                    return (
                      <div
                        key={video.IdVideo}
                        data-testid={`roadmap-lesson-${video.IdVideo}`}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 ${
                          isCompleted ? 'bg-emerald-500/[0.03]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums w-12 shrink-0">
                            Paso {index + 1}
                          </span>

                          <a
                            href={video.Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onMarkStepCompleted(video.IdVideo)}
                            aria-label={`Abrir "${video.Title}"`}
                            className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800"
                          >
                            <YouTubeThumbnail
                              youtubeId={video.youtubeId}
                              title={video.Title}
                              resourceType={resourceType}
                              className={isCompleted ? 'opacity-75 saturate-75' : ''}
                            />
                          </a>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <span className="font-mono tabular-nums">
                                #{String(video.IdVideo).padStart(2, '0')}
                              </span>
                              {video.Channel && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{video.Channel}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span>{video.levelLabel}</span>
                              {video.Duration > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    {formatDuration(video.Duration)}
                                  </span>
                                </>
                              )}
                            </div>

                            <a
                              href={video.Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onMarkStepCompleted(video.IdVideo)}
                              className={`mt-0.5 block text-xs sm:text-sm font-semibold leading-snug hover:underline ${
                                isCompleted
                                  ? 'text-zinc-600 dark:text-zinc-300'
                                  : 'text-zinc-950 dark:text-white'
                              }`}
                            >
                              {video.Title}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-14 sm:pl-0">
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
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                              isFavorite
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400'
                            }`}
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                              aria-hidden="true"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleStepCompleted(video.IdVideo)}
                            aria-pressed={isCompleted}
                            data-testid={`roadmap-toggle-${video.IdVideo}`}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              isCompleted
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isCompleted ? 'Completado' : 'Completar'}</span>
                          </button>

                          <a
                            href={video.Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onMarkStepCompleted(video.IdVideo)}
                            aria-label={`Ver clase "${video.Title}"`}
                            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
                          >
                            <span>Ver</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
