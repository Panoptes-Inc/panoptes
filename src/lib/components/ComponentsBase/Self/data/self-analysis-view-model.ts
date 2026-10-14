import { dummySnapshot } from '$lib/db/dummy/panoptes_dummy_ui';
import type { PanoptesSelfData } from '$lib/panoptes/types';
import { safeText } from '$lib/panoptes/utils/text';
import {
  createSelfImprovementCandidatePriorityLabel,
  formatSelfAnalysisDeltaValue,
  SELF_ANALYSIS_AXIS_DEFINITIONS
} from './self-analysis-overview-presentation';
import type { SelfAnalysisAxisKey } from './self-analysis-overview-presentation';

type AugmentedSelfSource = PanoptesSelfData & {
  companyName?: string;
  serviceName?: string;
  internalScore?: number;
  marketTypeLabel?: string;
  axisDeltaScores?: Partial<Record<SelfAnalysisAxisKey, number>>;
  summaryText?: string;
};

export type SelfAnalysisDeltaBadge = {
  label: string;
  value: number;
  displayValue: string;
  tone: 'positive' | 'negative';
};

export type SelfAnalysisMetricRow = {
  label: string;
  selfScore: number;
  benchmarkScore: number;
};

export type SelfAnalysisBreakdownRow = {
  label: string;
  score: number;
  finding: string;
};

export type SelfAnalysisEvaluationCardData = {
  title: string;
  accentLabel: string;
  summaryLines: string[];
  bulletLines: string[];
  footerLabel: string;
  tone: 'orange' | 'violet';
};

export type SelfAnalysisImprovementCandidateCardData = {
  rankLabel: string;
  title: string;
  summary: string;
  evidenceLines: string[];
  actionLines: string[];
  impactLines: string[];
};

export type SelfAnalysisViewModel = {
  companyName: string;
  serviceName: string;
  marketTypeLabel: string;
  overallScore: number;
  internalScore: number;
  visualScore: number;
  industryBenchmarkScore: number;
  deltaBadges: SelfAnalysisDeltaBadge[];
  strengths: string[];
  issues: string[];
  breakdownRows: SelfAnalysisBreakdownRow[];
  metricRows: SelfAnalysisMetricRow[];
  radar: Array<{ label: string; self: number; industry: number }>;
  aiSummary: string;
  primaryEvaluationCard: SelfAnalysisEvaluationCardData;
  technologyCheckCard: SelfAnalysisEvaluationCardData;
  improvementCandidateCards: SelfAnalysisImprovementCandidateCardData[];
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function parseBadgeLabel(sourceLabel: string, index: number): SelfAnalysisDeltaBadge {
  const matched = sourceLabel.match(/^(.*?)([+-]\d+)$/);
  if (!matched) {
    return {
      label: `差分指標 ${index + 1}`,
      value: 0,
      displayValue: formatSelfAnalysisDeltaValue(0),
      tone: 'positive'
    };
  }

  const value = Number(matched[2]);
  return {
    label: matched[1].trim(),
    value,
    displayValue: formatSelfAnalysisDeltaValue(value),
    tone: value >= 0 ? 'positive' : 'negative'
  };
}

function createRadar(source: AugmentedSelfSource): Array<{ label: string; self: number; industry: number }> {
  if (source.radar?.length) {
    return source.radar.map((item) => ({
      label: safeText(item.label, '指標'),
      self: clamp(item.self, 0, 100),
      industry: clamp(item.industry, 0, 100)
    }));
  }

  return source.breakdown.slice(0, 6).map((item) => ({
    label: safeText(item.label, '指標'),
    self: clamp(item.score, 0, 100),
    industry: clamp(item.score - 8, 0, 100)
  }));
}

function createDeltaBadges(
  source: AugmentedSelfSource,
  radar: Array<{ label: string; self: number; industry: number }>
): SelfAnalysisDeltaBadge[] {
  if (source.axisDeltaScores) {
    return SELF_ANALYSIS_AXIS_DEFINITIONS.map((axis) => {
      const value = source.axisDeltaScores?.[axis.key] ?? 0;
      return {
        label: axis.label,
        value,
        displayValue: formatSelfAnalysisDeltaValue(value),
        tone: value >= 0 ? 'positive' : 'negative'
      };
    });
  }

  if (source.gapBadges?.length) {
    return source.gapBadges.map(parseBadgeLabel);
  }

  return radar.map((item) => ({
    label: item.label,
    value: item.self - item.industry,
    displayValue: formatSelfAnalysisDeltaValue(item.self - item.industry),
    tone: item.self - item.industry >= 0 ? 'positive' : 'negative'
  }));
}

function createMetricRows(
  source: AugmentedSelfSource,
  radar: Array<{ label: string; self: number; industry: number }>
): SelfAnalysisMetricRow[] {
  if (radar.length) {
    return radar.map((item) => ({
      label: item.label,
      selfScore: item.self,
      benchmarkScore: item.industry
    }));
  }

  return source.breakdown.slice(0, 6).map((item) => ({
    label: safeText(item.label, '指標'),
    selfScore: clamp(item.score, 0, 100),
    benchmarkScore: clamp(item.score - 8, 0, 100)
  }));
}

function createBreakdownRows(source: AugmentedSelfSource): SelfAnalysisBreakdownRow[] {
  return source.breakdown.slice(0, 4).map((item) => ({
    label: safeText(item.label, '項目'),
    score: clamp(item.score, 0, 100),
    finding: safeText(item.finding, '観察結果を整理中です。')
  }));
}

function createPrimaryEvaluationCard(
  source: AugmentedSelfSource,
  marketTypeLabel: string
): SelfAnalysisEvaluationCardData {
  const actionCard = source.actionCards[0];

  return {
    title: '主要ページ導線評価',
    accentLabel: ` ${marketTypeLabel}`,
    summaryLines: [
      safeText(
        actionCard?.rationale,
        '比較検討フェーズで迷わない導線設計と、価値訴求の置き方を優先して改善する段階です。'
      ),
      `内部構造 ${source.internalScore ?? source.structureScore} / ビジュアル ${source.visualScore}`
    ],
    bulletLines: (actionCard?.bullets ?? source.strengths.slice(0, 3)).map((item) =>
      safeText(item, '主要導線を再設計する')
    ),
    footerLabel: safeText(source.strengths[0], '比較導線の再設計'),
    tone: 'orange'
  };
}

function createTechnologyCheckCard(source: AugmentedSelfSource): SelfAnalysisEvaluationCardData {
  const topBreakdowns = source.breakdown.slice(0, 3);

  return {
    title: '技術基盤チェック',
    accentLabel: `構造評価: ${topBreakdowns[0]?.score ?? source.visualScore}`,
    summaryLines: topBreakdowns.map(
      (item) =>
        `${safeText(item.label, '項目')} : ${item.score >= 75 ? '安定' : item.score >= 60 ? '要確認' : '改善余地あり'}`
    ),
    bulletLines: source.issues.slice(0, 3).map((item) =>
      safeText(item, '構造観点で再確認が必要です。')
    ),
    footerLabel: safeText(topBreakdowns[0]?.finding, '内部リンク密度を見直してください。'),
    tone: 'violet'
  };
}

function createImprovementCandidateCards(source: AugmentedSelfSource): SelfAnalysisImprovementCandidateCardData[] {
  return source.actionCards.slice(0, 3).map((item, index) => ({
    rankLabel: createSelfImprovementCandidatePriorityLabel(index),
    title: safeText(item.title, '改善候補'),
    summary: safeText(item.rationale, '観察結果をもとに改善優先度を整理しています。'),
    evidenceLines: source.strengths.slice(0, 2).map((line) => safeText(line, '主要強みを整理中')),
    actionLines: item.bullets.map((line) => safeText(line, 'アクションを整理中')),
    impactLines: [safeText(item.impact, 'インパクト評価を整理中')]
  }));
}

function averageBenchmarkScore(metricRows: SelfAnalysisMetricRow[]): number {
  if (!metricRows.length) return 68;
  return Math.round(metricRows.reduce((total, row) => total + row.benchmarkScore, 0) / metricRows.length);
}

export function createSelfAnalysisViewModel({
  data,
  siteName
}: {
  data: PanoptesSelfData;
  siteName?: string;
}): SelfAnalysisViewModel {
  const source = data as AugmentedSelfSource;
  const radar = createRadar(source);
  const metricRows = createMetricRows(source, radar);
  const marketTypeLabel = safeText(source.marketTypeLabel ?? source.typeLabel, '成熟 × 比較検討型');
  const internalScore = clamp(source.internalScore ?? source.structureScore, 0, 100);
  const visualScore = clamp(source.visualScore, 0, 100);

  return {
    companyName: safeText(source.companyName ?? siteName, '自社サイト'),
    serviceName: safeText(source.serviceName ?? siteName, 'Panoptes Self'),
    marketTypeLabel,
    overallScore: clamp(source.overallScore, 0, 100),
    internalScore,
    visualScore,
    industryBenchmarkScore: averageBenchmarkScore(metricRows),
    deltaBadges: createDeltaBadges(source, radar),
    strengths: source.strengths.map((item) => safeText(item, '強みを整理中です。')).slice(0, 3),
    issues: source.issues.map((item) => safeText(item, '課題を整理中です。')).slice(0, 3),
    breakdownRows: createBreakdownRows(source),
    metricRows,
    radar,
    aiSummary: safeText(
      source.summaryText ?? source.aiSummary?.[0],
      '内部構造と見た目品質を比べると、比較導線と差別化表現の改善余地が残っています。'
    ),
    primaryEvaluationCard: createPrimaryEvaluationCard(source, marketTypeLabel),
    technologyCheckCard: createTechnologyCheckCard(source),
    improvementCandidateCards: createImprovementCandidateCards(source)
  };
}

export const dummySelfAnalysisViewModel = createSelfAnalysisViewModel({
  data: dummySnapshot.self,
  siteName: dummySnapshot.siteName
});
