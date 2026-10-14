import { describe, expect, it } from 'vitest';
import { COMPETITOR_COMMON_AXIS_LABELS } from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation';
import {
	createSelfImprovementCandidatePriorityLabel,
	formatSelfAnalysisDeltaValue,
	SELF_ANALYSIS_AXIS_DEFINITIONS
} from '../../src/lib/components/ComponentsBase/Self/data/self-analysis-overview-presentation';
import { createSelfAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Self/data/self-analysis-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';
import type { PanoptesSelfData } from '../../src/lib/panoptes/types';

function createSelfSource(overrides: Partial<PanoptesSelfData> = {}): PanoptesSelfData {
	const source = dummySnapshot.self;
	return {
		overallScore: source.overallScore,
		typeLabel: source.typeLabel,
		structureScore: source.structureScore,
		visualScore: source.visualScore,
		gapBadges: [...source.gapBadges],
		radar: source.radar.map((item) => ({ ...item })),
		strengths: [...source.strengths],
		issues: [...source.issues],
		breakdown: source.breakdown.map((item) => ({ ...item })),
		aiSummary: [...source.aiSummary],
		actionCards: source.actionCards.map((item) => ({ ...item, bullets: [...item.bullets] })),
		...overrides
	};
}

describe('Self analysis overview presentation mapping', () => {
	it('keeps the established Self six-axis order and labels', () => {
		expect(SELF_ANALYSIS_AXIS_DEFINITIONS.map((axis) => axis.label)).toEqual([
			'価値訴求',
			'導線強度',
			'差別化明確性',
			'情報階層',
			'信頼構造',
			'意思決定支援'
		]);
	});

	it('records the intentional label difference from the Competitor presentation', () => {
		expect(SELF_ANALYSIS_AXIS_DEFINITIONS.map((axis) => axis.label)).not.toEqual(
			COMPETITOR_COMMON_AXIS_LABELS
		);
		expect(COMPETITOR_COMMON_AXIS_LABELS[2]).toBe('差別化');
		expect(SELF_ANALYSIS_AXIS_DEFINITIONS[2].label).toBe('差別化明確性');
	});

	it('formats positive, zero, and negative observed deltas', () => {
		expect(formatSelfAnalysisDeltaValue(8)).toBe('+8');
		expect(formatSelfAnalysisDeltaValue(0)).toBe('+0');
		expect(formatSelfAnalysisDeltaValue(-6)).toBe('-6');
	});

	it('keeps improvement-candidate priority based on self.actionCards source order', () => {
		expect(createSelfImprovementCandidatePriorityLabel(0)).toBe('1. 優先候補');
		expect(createSelfImprovementCandidatePriorityLabel(2)).toBe('3. 優先候補');
	});

	it('clamps low/high scores and converts non-finite display input to zero', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({
				overallScore: 140,
				structureScore: -20,
				visualScore: Number.NaN,
				radar: [{ label: '軸', self: 130, industry: -10 }]
			})
		});

		expect(viewModel.overallScore).toBe(100);
		expect(viewModel.internalScore).toBe(0);
		expect(viewModel.visualScore).toBe(0);
		expect(viewModel.radar[0]).toEqual({ label: '軸', self: 100, industry: 0 });
	});

	it('maps gap badges as observed industry deltas with display-safe fallback', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({ gapBadges: ['価値訴求 +4', 'malformed'] })
		});

		expect(viewModel.deltaBadges).toEqual([
			{ label: '価値訴求', value: 4, displayValue: '+4', tone: 'positive' },
			{ label: '差分指標 2', value: 0, displayValue: '+0', tone: 'positive' }
		]);
	});
});

describe('B-2 Self Snapshot boundary regression', () => {
	it('maps improvement candidates only from self.actionCards', () => {
		const source = createSelfSource();
		const viewModel = createSelfAnalysisViewModel({ data: source });

		expect(viewModel.improvementCandidateCards).toHaveLength(source.actionCards.length);
		expect(viewModel.improvementCandidateCards[0]?.title).toBe(source.actionCards[0]?.title);
		expect(viewModel.improvementCandidateCards[0]?.actionLines).toEqual(
			source.actionCards[0]?.bullets
		);
		expect('strategyRecommendationCards' in viewModel).toBe(false);
		expect('roadmap' in viewModel).toBe(false);
	});

	it('keeps empty gaps and actionCards renderable without inventing Strategy data', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({ gapBadges: [], radar: [], breakdown: [], actionCards: [] })
		});

		expect(viewModel.deltaBadges).toEqual([]);
		expect(viewModel.breakdownRows).toEqual([]);
		expect(viewModel.improvementCandidateCards).toEqual([]);
		expect(viewModel.industryBenchmarkScore).toBe(68);
	});

	it('keeps empty strengths and issues as current-state empty collections', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({ strengths: [], issues: [] })
		});

		expect(viewModel.strengths).toEqual([]);
		expect(viewModel.issues).toEqual([]);
	});

	it('provides fallbacks for malformed optional presentation text', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({
				typeLabel: '',
				aiSummary: [],
				breakdown: [{ label: '', score: 55, finding: '' }],
				actionCards: [{ title: '', rationale: '', impact: '', bullets: [''] }]
			})
		});

		expect(viewModel.marketTypeLabel).toBe('成熟 × 比較検討型');
		expect(viewModel.aiSummary.length).toBeGreaterThan(0);
		expect(viewModel.breakdownRows[0]?.label).toBe('項目');
		expect(viewModel.breakdownRows[0]?.finding).toBe('観察結果を整理中です。');
		expect(viewModel.improvementCandidateCards[0]?.title).toBe('改善候補');
	});

	it('preserves valid long current-state and improvement-candidate text', () => {
		const longText = '現在状態と改善候補を説明する長文'.repeat(30);
		const viewModel = createSelfAnalysisViewModel({
			data: createSelfSource({
				strengths: [longText],
				issues: [longText],
				aiSummary: [longText],
				actionCards: [
					{ title: longText, rationale: longText, impact: longText, bullets: [longText] }
				]
			})
		});

		expect(viewModel.strengths).toEqual([longText]);
		expect(viewModel.issues).toEqual([longText]);
		expect(viewModel.aiSummary).toBe(longText);
		expect(viewModel.improvementCandidateCards[0]?.title).toBe(longText);
		expect(viewModel.improvementCandidateCards[0]?.actionLines).toEqual([longText]);
	});

	it('keeps observation, gap, and improvement candidates as separate view-model fields', () => {
		const viewModel = createSelfAnalysisViewModel({ data: createSelfSource() });

		expect(viewModel.strengths.length).toBeGreaterThan(0);
		expect(viewModel.deltaBadges.length).toBeGreaterThan(0);
		expect(viewModel.improvementCandidateCards.length).toBeGreaterThan(0);
	});
});
