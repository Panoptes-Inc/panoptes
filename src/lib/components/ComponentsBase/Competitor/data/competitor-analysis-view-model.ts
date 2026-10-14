import { dummySnapshot } from '$lib/db/dummy/panoptes_dummy_ui';
import type { PanoptesAnalysisSnapshotPayload, PanoptesCompetitorCard } from '$lib/panoptes/types';
import { safeText } from '$lib/panoptes/utils/text';
import {
  createCompetitorRadarPoints,
  normalizeCompetitorExternalUrl
} from './competitor-card-presentation';
import type { CompetitorAnalysisRadarPoint } from './competitor-card-presentation';

export type { CompetitorAnalysisRadarPoint } from './competitor-card-presentation';

export type CompetitorAnalysisCardViewModel = {
  competitorId: string;
  companyName: string;
  serviceName: string;
  url: string;
  marketTypeLabel: string;
  marketPositionSummary: string;
  internalStructureScore: number;
  visualScore: number;
  overallScore: number;
  considerationPeriodLabel: string;
  funnelTypeLabel: string;
  mustElementLabels: string[];
  descriptorBadges: string[];
  radarPoints: CompetitorAnalysisRadarPoint[];
  detailSummary: string;
  insightLines: string[];
  actionLines: string[];
};

export type CompetitorAnalysisViewModel = {
  summaryTitle: string;
  summaryText: string;
  cards: CompetitorAnalysisCardViewModel[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isUnusableText(value: string | null | undefined): boolean {
  if (!value) return true;
  return /\?{3,}/.test(value);
}

function readableText(value: string | null | undefined, fallback: string): string {
  return isUnusableText(value) ? fallback : safeText(value, fallback);
}

function cleanArray(source: string[] | undefined, fallback: string[]): string[] {
  const normalized = (source ?? [])
    .map((item, index) => readableText(item, fallback[index] ?? fallback[fallback.length - 1] ?? '項目'))
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
}

function createConsiderationPeriodLabel(marketTypeLabel: string): string {
  return marketTypeLabel.includes('比較') ? '比較検討期' : '認知フェーズ';
}

function createFunnelTypeLabel(marketTypeLabel: string): string {
  return marketTypeLabel.includes('比較') ? '比較検討型' : 'リード獲得型';
}

function createCompetitorCardViewModel(card: PanoptesCompetitorCard): CompetitorAnalysisCardViewModel {
  const marketTypeLabel = readableText(card.marketTypeLabel, '成熟 × 比較検討型');

  return {
    competitorId: card.competitorId,
    companyName: readableText(card.companyName, '競合企業'),
    serviceName: readableText(card.serviceName, 'サービス'),
    url: normalizeCompetitorExternalUrl(card.url),
    marketTypeLabel,
    marketPositionSummary: readableText(card.fitReason, '業界内でのポジションは比較検討寄りです。'),
    internalStructureScore: clamp(card.internalStructureScore, 0, 100),
    visualScore: clamp(card.visualScore, 0, 100),
    overallScore: clamp(card.overallScore, 0, 100),
    considerationPeriodLabel: createConsiderationPeriodLabel(marketTypeLabel),
    funnelTypeLabel: createFunnelTypeLabel(marketTypeLabel),
    mustElementLabels: cleanArray(card.actionBullets?.slice(0, 3), ['価格', '比較表', '実績']),
    descriptorBadges: cleanArray(card.tags, ['#比較検討', '#構造整理']),
    radarPoints: createCompetitorRadarPoints(card),
    detailSummary: readableText(card.detailSummary, '競合の構造・訴求・信頼表現を比較できます。'),
    insightLines: cleanArray(card.insightLines, ['構造が明確', '訴求が一貫している']),
    actionLines: cleanArray(card.actionBullets, ['比較ページを再設計', 'CTA文言を統一'])
  };
}

export function createCompetitorAnalysisViewModel({
  data
}: {
  data?: PanoptesAnalysisSnapshotPayload['competitors'] | null;
}): CompetitorAnalysisViewModel {
  const source = data ?? dummySnapshot.competitors;

  return {
    summaryTitle: readableText(source.summaryTitle, '競合10社分析'),
    summaryText: readableText(
      source.summaryText,
      '主要競合の構造・訴求・信頼表現を10社分並べて確認し、必要な比較対象だけを右側に展開できます。'
    ),
    cards: source.cards.map(createCompetitorCardViewModel)
  };
}

export const dummyCompetitorAnalysisViewModel = createCompetitorAnalysisViewModel({
  data: dummySnapshot.competitors
});
