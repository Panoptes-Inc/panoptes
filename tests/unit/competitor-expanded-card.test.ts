import { describe, expect, it } from 'vitest';
import {
	COMPETITOR_COMMON_AXIS_LABELS,
	createCompetitorCompanyScoreRing,
	createCompetitorExpandedActionLabels,
	createCompetitorExpandedScoreRing,
	createCompetitorRadarPoints,
	normalizeCompetitorExternalUrl
} from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation';
import { createCompetitorAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-analysis-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';

describe('competitor expanded-card presentation mapping', () => {
	it('keeps the established common six-axis order', () => {
		expect(COMPETITOR_COMMON_AXIS_LABELS).toEqual([
			'価値訴求',
			'導線強度',
			'差別化',
			'情報階層',
			'信頼構造',
			'意思決定'
		]);
	});

	it('maps and clamps low/high scores without changing the existing formulas', () => {
		const low = createCompetitorRadarPoints({
			overallScore: -20,
			internalStructureScore: -10,
			visualScore: -5
		});
		const high = createCompetitorRadarPoints({
			overallScore: 150,
			internalStructureScore: 140,
			visualScore: 130
		});

		expect(low).toHaveLength(6);
		expect(low.every((point) => point.value >= 0)).toBe(true);
		expect(high.every((point) => point.value <= 100)).toBe(true);
		expect(low.map((point) => point.label)).toEqual(COMPETITOR_COMMON_AXIS_LABELS);
	});

	it('clamps score-ring presentation to the 0-100 range', () => {
		expect(createCompetitorExpandedScoreRing(-10)).toContain('0deg');
		expect(createCompetitorExpandedScoreRing(120)).toContain('360deg');
		expect(createCompetitorCompanyScoreRing(-10)).toContain('0deg');
		expect(createCompetitorCompanyScoreRing(120)).toContain('360deg');
	});

	it('keeps safe HTTP URLs and rejects unsafe or malformed external links', () => {
		expect(normalizeCompetitorExternalUrl('https://example.com/path?q=1')).toBe(
			'https://example.com/path?q=1'
		);
		expect(normalizeCompetitorExternalUrl('http://example.com')).toBe('http://example.com');
		expect(normalizeCompetitorExternalUrl('javascript:alert(1)')).toBe('');
		expect(normalizeCompetitorExternalUrl('https://user:secret@example.com')).toBe('');
		expect(normalizeCompetitorExternalUrl('not a url')).toBe('');
		expect(normalizeCompetitorExternalUrl('')).toBe('');
	});
});

describe('B-2 canonical competitor detail regression', () => {
	it('preserves URL, insights, actions, score, badges, and six axes', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({ data: dummySnapshot.competitors }).cards[0]!;

		expect(card.url).toBe(source.url);
		expect(card.insightLines).toEqual(source.insightLines);
		expect(card.actionLines).toEqual(source.actionBullets);
		expect(card.overallScore).toBe(source.overallScore);
		expect(card.descriptorBadges).toEqual(source.tags);
		expect(card.radarPoints.map((point) => point.label)).toEqual(COMPETITOR_COMMON_AXIS_LABELS);
	});

	it('hides an invalid URL while keeping the competitor renderable', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: 'Competitors',
				summaryText: 'Summary',
				cards: [{ ...source, url: 'data:text/html,unsafe' }]
			}
		}).cards[0]!;

		expect(card.url).toBe('');
		expect(card.companyName).not.toBe('');
	});

	it('provides display-safe fallbacks for empty and malformed detail collections', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '',
				summaryText: '',
				cards: [
					{
						...source,
						companyName: '縺薙ｌ縺ｯ譁・ｭ怜喧縺代〒縺吶',
						serviceName: '',
						detailSummary: '',
						insightLines: [],
						actionBullets: [],
						tags: []
					}
				]
			}
		}).cards[0]!;

		expect(card.companyName).toBe('競合企業');
		expect(card.serviceName).toBe('サービス');
		expect(card.detailSummary).not.toBe('');
		expect(card.insightLines.length).toBeGreaterThan(0);
		expect(card.actionLines.length).toBeGreaterThan(0);
		expect(card.descriptorBadges.length).toBeGreaterThan(0);
	});

	it('preserves valid long names, summaries, insights, and actions without mapping truncation', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const longText = '比較検討に必要な情報と意思決定支援を詳細に説明する文章'.repeat(8);
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: 'Competitors',
				summaryText: 'Summary',
				cards: [
					{
						...source,
						companyName: longText,
						detailSummary: longText,
						insightLines: [longText],
						actionBullets: [longText]
					}
				]
			}
		}).cards[0]!;

		expect(card.companyName).toBe(longText);
		expect(card.detailSummary).toBe(longText);
		expect(card.insightLines).toEqual([longText]);
		expect(card.actionLines).toEqual([longText]);
	});

	it('keeps the expanded-card detail/compare action-label contract', () => {
		expect(createCompetitorExpandedActionLabels(false)).toEqual({
			detail: '詳細を閉じる',
			compare: '比較表示'
		});
		expect(createCompetitorExpandedActionLabels(true)).toEqual({
			detail: '詳細を選択',
			compare: '比較解除'
		});
	});

	it('keeps long text and fallback data renderable without exposing an invalid URL', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const longText = '長い競合分析テキスト'.repeat(40);
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '',
				summaryText: '',
				cards: [
					{
						...source,
						url: 'javascript:alert(1)',
						companyName: longText,
						insightLines: [],
						actionBullets: []
					}
				]
			}
		}).cards[0]!;
		expect(card.companyName).toBe(longText);
		expect(card.insightLines).toEqual(['構造が明確', '訴求が一貫している']);
		expect(card.actionLines).toEqual(['比較ページを再設計', 'CTA文言を統一']);
		expect(card.url).toBe('');
	});
});
