import { describe, expect, it } from 'vitest';
import { createCompetitorAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Competitor/data/competitor-analysis-view-model';
import { createIndustryAnalysisViewModel } from '../../src/lib/components/ComponentsBase/industry/data/industry-analysis-view-model';
import { createSelfAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Self/data/self-analysis-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';

describe('Snapshot feature view models', () => {
	it('ports competitor detail fields without dropping URL, insights, or actions', () => {
		const source = dummySnapshot.competitors.cards[0]!;
		const viewModel = createCompetitorAnalysisViewModel({ data: dummySnapshot.competitors });
		const card = viewModel.cards[0]!;

		expect(card.url).toBe(source.url);
		expect(card.insightLines).toEqual(source.insightLines);
		expect(card.actionLines).toEqual(source.actionBullets);
		expect(card.overallScore).toBe(source.overallScore);
		expect(card.radarPoints).toHaveLength(6);
	});

	it('keeps an empty competitor snapshot renderable', () => {
		const viewModel = createCompetitorAnalysisViewModel({
			data: { summaryTitle: '', summaryText: '', cards: [] }
		});

		expect(viewModel.cards).toEqual([]);
		expect(viewModel.summaryTitle.length).toBeGreaterThan(0);
	});

	it('keeps every industry section on the current domain contract', () => {
		const viewModel = createIndustryAnalysisViewModel({ data: dummySnapshot.industry });

		expect(viewModel.marketType).toBe(dummySnapshot.industry.marketType);
		expect(viewModel.rating).toBe(dummySnapshot.industry.rating);
		expect(viewModel.position).toBe(dummySnapshot.industry.position);
		expect(viewModel.distribution).toBe(dummySnapshot.industry.distribution);
		expect(viewModel.opportunity).toBe(dummySnapshot.industry.opportunity);
		expect(viewModel.signals).toBe(dummySnapshot.industry.signals);
	});

	it('keeps Self analysis actions sourced from Self data rather than Strategy plans', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: dummySnapshot.self,
			siteName: dummySnapshot.siteName
		});

		expect(viewModel.overallScore).toBe(dummySnapshot.self.overallScore);
		expect(viewModel.radar).toEqual(dummySnapshot.self.radar);
		expect(viewModel.improvementCandidateCards[0]?.title).toBe(
			dummySnapshot.self.actionCards[0]?.title
		);
		expect(viewModel.improvementCandidateCards[0]?.actionLines).toEqual(
			dummySnapshot.self.actionCards[0]?.bullets
		);
	});

	it('keeps a partial Self snapshot with empty collections renderable', () => {
		const viewModel = createSelfAnalysisViewModel({
			data: {
				...dummySnapshot.self,
				gapBadges: [],
				radar: [],
				strengths: [],
				issues: [],
				breakdown: [],
				aiSummary: [],
				actionCards: []
			}
		});

		expect(viewModel.radar).toEqual([]);
		expect(viewModel.breakdownRows).toEqual([]);
		expect(viewModel.improvementCandidateCards).toEqual([]);
		expect(viewModel.industryBenchmarkScore).toBe(68);
	});
});
