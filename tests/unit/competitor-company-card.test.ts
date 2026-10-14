import { describe, expect, it } from 'vitest';
import {
	COMPETITOR_COMMON_AXIS_LABELS,
	createCompetitorCompanyActionLabels,
	createCompetitorCompanyScoreRing,
	createCompetitorCompareLabel,
	createCompetitorExpandedScoreRing,
	formatCompetitorScorePercentage
} from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation';
import { createCompetitorAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-analysis-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';

describe('Competitor Company Card presentation mapping', () => {
	it('preserves the legacy/current ring formula difference before Product decision', () => {
		const company = createCompetitorCompanyScoreRing(50);
		const expanded = createCompetitorExpandedScoreRing(50);

		expect(company).toContain('#7d73ff 180deg 204deg');
		expect(expanded).toContain('#7d73ff 180deg 210deg');
		expect(company).not.toBe(expanded);
	});

	it('preserves the Company 24-degree and Expanded 30-degree accent at zero', () => {
		expect(createCompetitorCompanyScoreRing(0)).toContain('#7d73ff 0deg 24deg');
		expect(createCompetitorExpandedScoreRing(0)).toContain('#7d73ff 0deg 30deg');
	});

	it('clamps low and high ring inputs while retaining each current formula', () => {
		expect(createCompetitorCompanyScoreRing(-20)).toContain('#7d73ff 0deg 24deg');
		expect(createCompetitorCompanyScoreRing(140)).toContain('#7d73ff 360deg 384deg');
		expect(createCompetitorExpandedScoreRing(-20)).toContain('#7d73ff 0deg 30deg');
		expect(createCompetitorExpandedScoreRing(140)).toContain('#7d73ff 360deg 390deg');
	});

	it('maps non-finite ring input to a display-safe zero score', () => {
		expect(createCompetitorCompanyScoreRing(Number.NaN)).toContain('#7d73ff 0deg 24deg');
		expect(createCompetitorExpandedScoreRing(Number.POSITIVE_INFINITY)).toContain(
			'#7d73ff 0deg 30deg'
		);
	});

	it('formats score bars as clamped percentages', () => {
		expect(formatCompetitorScorePercentage(-1)).toBe('0%');
		expect(formatCompetitorScorePercentage(0)).toBe('0%');
		expect(formatCompetitorScorePercentage(64)).toBe('64%');
		expect(formatCompetitorScorePercentage(120)).toBe('100%');
		expect(formatCompetitorScorePercentage(Number.NaN)).toBe('0%');
	});

	it('keeps selected/compared action labels independent from business-state ownership', () => {
		expect(createCompetitorCompanyActionLabels(false)).toEqual({
			detail: '詳細分析',
			compare: '比較表示'
		});
		expect(createCompetitorCompanyActionLabels(true)).toEqual({
			detail: '詳細分析',
			compare: '比較解除'
		});
		expect(createCompetitorCompareLabel(false)).toBe('比較表示');
		expect(createCompetitorCompareLabel(true)).toBe('比較解除');
	});
});

describe('Competitor Company Card canonical view-data regression', () => {
	it('keeps normal company identity and aggregate scores', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({ data: dummySnapshot.competitors }).cards[0]!;

		expect(card.companyName).toBe(source.companyName);
		expect(card.serviceName).toBe(source.serviceName);
		expect(card.overallScore).toBe(source.overallScore);
		expect(card.internalStructureScore).toBe(source.internalStructureScore);
		expect(card.visualScore).toBe(source.visualScore);
	});

	it('keeps company identity display-safe when source text is unusable', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '',
				summaryText: '',
				cards: [{ ...source, companyName: '', serviceName: '???' }]
			}
		}).cards[0]!;

		expect(card.companyName).toBe('競合企業');
		expect(card.serviceName).toBe('サービス');
	});

	it('preserves valid long company and service names without mapping truncation', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const longText = '長い競合企業・サービス名'.repeat(30);
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '競合',
				summaryText: '概要',
				cards: [{ ...source, companyName: longText, serviceName: longText }]
			}
		}).cards[0]!;

		expect(card.companyName).toBe(longText);
		expect(card.serviceName).toBe(longText);
	});

	it('keeps the six-axis detail model separate from the aggregate Company Card', () => {
		const card = createCompetitorAnalysisViewModel({ data: dummySnapshot.competitors }).cards[0]!;

		expect(card.radarPoints.map((point) => point.label)).toEqual(COMPETITOR_COMMON_AXIS_LABELS);
		expect(card.radarPoints).toHaveLength(6);
	});

	it('keeps URL normalization in the shared view model although Company Card has no link', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '競合',
				summaryText: '概要',
				cards: [{ ...source, url: 'javascript:alert(1)' }]
			}
		}).cards[0]!;

		expect(card.url).toBe('');
		expect(card.companyName).not.toBe('');
	});

	it('keeps view-model scores within the existing 0-100 canonical range', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const card = createCompetitorAnalysisViewModel({
			data: {
				summaryTitle: '競合',
				summaryText: '概要',
				cards: [
					{
						...source,
						overallScore: 140,
						internalStructureScore: -20,
						visualScore: 120
					}
				]
			}
		}).cards[0]!;

		expect(card.overallScore).toBe(100);
		expect(card.internalStructureScore).toBe(0);
		expect(card.visualScore).toBe(100);
	});
});
