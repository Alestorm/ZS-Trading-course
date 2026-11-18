import { EnrichedVideo, RoadmapStage } from '../types/video';

interface StageRule {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  levelSummary: string;
  match: (video: EnrichedVideo) => boolean;
}

const STAGE_RULES: StageRule[] = [
  {
    id: 'etapa-1-fundamentos',
    stepNumber: 1,
    title: 'Fundamentos del Trading y Mercados',
    description:
      'Comprende cómo funcionan los mercados financieros, cuentas demo, tipos de órdenes, velas japonesas y bases del análisis técnico desde cero.',
    levelSummary: 'Básico · Inicio recomendado',
    match: (v) => v.IdCategory === 1,
  },
  {
    id: 'etapa-2-herramientas-indicadores',
    stepNumber: 2,
    title: 'Herramientas, Plataformas e Indicadores',
    description:
      'Domina TradingView, exchanges y terminales profesionales junto con medias móviles, RSI, VWAP y Volume Profile.',
    levelSummary: 'Básico – Intermedio',
    match: (v) => v.IdCategory === 3 || v.IdCategory === 6,
  },
  {
    id: 'etapa-3-riesgo-psicotrading',
    stepNumber: 3,
    title: 'Gestión de Riesgo y Psicotrading',
    description:
      'Protege tu capital antes de operar en real: cálculo de riesgo, Stop Loss, apalancamiento, control del drawdown y disciplina emocional.',
    levelSummary: 'Básico – Intermedio',
    match: (v) => v.IdCategory === 8 || v.IdCategory === 9,
  },
  {
    id: 'etapa-4-cripto-estrategias',
    stepNumber: 4,
    title: 'Ecosistema Cripto y Estrategias Operativas',
    description:
      'Aplica ciclos de Bitcoin, Spot/DCA, altcoins y sistemas concretos de Scalping, Day Trading e inversión en índices, Forex y oro.',
    levelSummary: 'Intermedio',
    match: (v) => v.IdCategory === 2 || v.IdCategory === 4,
  },
  {
    id: 'etapa-5-wyckoff',
    stepNumber: 5,
    title: 'Metodología Wyckoff Profesional',
    description:
      'Interpreta la ley de oferta y demanda, fases de acumulación y distribución institucional, temporalidades y volumen aplicado.',
    levelSummary: 'Avanzado',
    match: (v) => v.IdCategory === 5,
  },
  {
    id: 'etapa-6-maestria',
    stepNumber: 6,
    title: 'Trading Institucional y Maestría Avanzada',
    description:
      'Integra Price Action, Smart Money Concepts, Order Book, Order Flow, fractalidad, macroeconomía y operativa en alta volatilidad.',
    levelSummary: 'Avanzado',
    match: (v) => v.IdCategory === 7,
  },
];

/**
 * Organizes all catalog videos into 6 progressive pedagogical stages ordered from Básico -> Intermedio -> Avanzado.
 */
export function buildRoadmapStages(videos: EnrichedVideo[]): RoadmapStage[] {
  const assigned = new Set<number>();

  return STAGE_RULES.map((rule) => {
    const stageVideos = videos
      .filter((video) => {
        if (assigned.has(video.IdVideo)) return false;
        return rule.match(video);
      })
      .sort((a, b) => a.IdLevel - b.IdLevel || a.IdCategory - b.IdCategory || a.IdVideo - b.IdVideo);

    for (const v of stageVideos) {
      assigned.add(v.IdVideo);
    }

    return {
      id: rule.id,
      stepNumber: rule.stepNumber,
      title: rule.title,
      description: rule.description,
      levelSummary: rule.levelSummary,
      videos: stageVideos,
    };
  }).filter((stage) => stage.videos.length > 0);
}
