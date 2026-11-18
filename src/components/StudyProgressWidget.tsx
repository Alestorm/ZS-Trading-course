import React, { useRef, useState } from 'react';
import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Upload,
} from 'lucide-react';
import { Category, CategoryProgress } from '../types/video';
import { formatCategoryDisplayName } from '../data/catalog';

interface StudyProgressWidgetProps {
  watchedCount: number;
  totalCount: number;
  watchedMinutes: number;
  totalMinutes: number;
  categories: Category[];
  categoryProgress: Map<number, CategoryProgress>;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onFilterWatched: () => void;
  onFilterUnwatched: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<{ ok: boolean; message: string }>;
}

export const StudyProgressWidget: React.FC<StudyProgressWidgetProps> = ({
  watchedCount,
  totalCount,
  watchedMinutes,
  totalMinutes,
  categories,
  categoryProgress,
  selectedCategoryId,
  onSelectCategory,
  onFilterWatched,
  onFilterUnwatched,
  onExportBackup,
  onImportBackup,
}) => {
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const percent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const pendingCount = Math.max(0, totalCount - watchedCount);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await onImportBackup(file);
    setBackupFeedback(result);
  };

  const handleExportClick = () => {
    onExportBackup();
    setBackupFeedback({
      ok: true,
      message: 'Respaldo JSON descargado correctamente.',
    });
  };

  return (
    <section
      aria-label="Progreso de estudio"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold text-zinc-950 dark:text-white">
          Tu progreso
        </h2>
        {totalMinutes > 0 && (
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            {watchedMinutes}/{totalMinutes} min
          </span>
        )}
      </div>

      {/* Circular Progress Ring Widget */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Porcentaje completado"
        className="relative mx-auto flex h-36 w-36 items-center justify-center"
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-zinc-100 dark:text-zinc-800"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-emerald-600 dark:text-emerald-500 transition-all duration-300 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-zinc-950 dark:text-white tabular-nums">
            {percent}%
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
            {watchedCount}/{totalCount} clases
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        {totalCount === 0
          ? 'Cargando resumen de progreso...'
          : pendingCount === 0
            ? 'Has completado todas las clases.'
            : `${pendingCount} ${pendingCount === 1 ? 'clase pendiente' : 'clases pendientes'} por completar`}
      </p>

      {/* Two-Column Quick Filters */}
      <div className="grid grid-cols-2 gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
        <button
          type="button"
          onClick={onFilterUnwatched}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          <span>Pendientes</span>
        </button>
        <button
          type="button"
          onClick={onFilterWatched}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <BookOpenCheck
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>Vistos</span>
        </button>
      </div>

      {/* Category Progress Breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2.5">
          <button
            type="button"
            onClick={() => setShowCategoryBreakdown((prev) => !prev)}
            aria-expanded={showCategoryBreakdown}
            data-testid="toggle-category-progress"
            className="flex w-full items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Progreso por categoría ({categories.length})</span>
            {showCategoryBreakdown ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>

          {showCategoryBreakdown && (
            <ul
              data-testid="category-progress-list"
              className="space-y-2 max-h-60 overflow-y-auto pr-0.5"
            >
              {categories.map((cat) => {
                const stat = categoryProgress.get(cat.IdCategory) ?? {
                  categoryId: cat.IdCategory,
                  watched: 0,
                  total: 0,
                  percent: 0,
                };
                const isSelected = selectedCategoryId === cat.IdCategory;
                const displayName = formatCategoryDisplayName(cat.Name);
                return (
                  <li key={cat.IdCategory}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(isSelected ? null : cat.IdCategory)}
                      aria-pressed={isSelected}
                      className={`w-full rounded-lg p-2 text-left transition-colors cursor-pointer border ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-200 dark:bg-zinc-800/80'
                          : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {displayName}
                        </span>
                        <span className="shrink-0 font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                          {stat.watched}/{stat.total} ({stat.percent}%)
                        </span>
                      </div>
                      <div
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                      >
                        <div
                          className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* JSON Backup Export / Import */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2">
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          Respaldo de progreso (.json)
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportClick}
            data-testid="export-backup-button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            data-testid="import-backup-button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            <span>Importar</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
            data-testid="import-backup-input"
            className="sr-only"
          />
        </div>

        {backupFeedback && (
          <p
            role="status"
            data-testid="backup-feedback"
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug ${
              backupFeedback.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            {backupFeedback.message}
          </p>
        )}
      </div>
    </section>
  );
};
