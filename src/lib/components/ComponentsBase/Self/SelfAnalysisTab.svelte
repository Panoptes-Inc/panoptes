<script lang="ts">
  import type { PanoptesSelfData } from '$lib/panoptes/types';
  import SelfAnalysisComparisonPanel from './analysis/SelfAnalysisComparisonPanel.svelte';
  import {
    createSelfAnalysisViewModel,
    dummySelfAnalysisViewModel
  } from './data/self-analysis-view-model';
  import SelfAnalysisEvaluationCard from './evaluation/SelfAnalysisEvaluationCard.svelte';
  import SelfAnalysisOverviewPanel from './overview/SelfAnalysisOverviewPanel.svelte';
  import SelfAnalysisImprovementCandidateGrid from './strategy/SelfAnalysisStrategyRecommendationGrid.svelte';

  let {
    data = null,
    siteName = '自社サイト',
    useDummyData = false
  }: {
    data?: PanoptesSelfData | null;
    siteName?: string;
    useDummyData?: boolean;
  } = $props();

  const viewModel = $derived(
    useDummyData || !data
      ? dummySelfAnalysisViewModel
      : createSelfAnalysisViewModel({
          data,
          siteName
        })
  );
</script>

<section class="self-analysis-tab">
  <header class="self-analysis-header">
    <div>
      <p class="subtitle">{viewModel.serviceName} の内部構造と見た目品質を、業界基準と並べて確認できます。</p>
    </div>
  </header>

  <div class="self-analysis-top-grid">
    <div class="overview-pane">
      <SelfAnalysisOverviewPanel {viewModel} />      
    </div>

    <div class="right-pane">

      <div class="comparision-pane">
        <SelfAnalysisComparisonPanel metricRows={viewModel.metricRows} radar={viewModel.radar} />        
      </div>

      <div class="self-analysis-bottom-grid">

        <div class="self-analysis-evaluation-column">
          <SelfAnalysisEvaluationCard card={viewModel.primaryEvaluationCard} />
          <SelfAnalysisEvaluationCard card={viewModel.technologyCheckCard} />
        </div>

        <section class="self-analysis-strategy-column">
          <SelfAnalysisImprovementCandidateGrid cards={viewModel.improvementCandidateCards} />
        </section>

      </div>      

    </div>

  </div>


</section>

<style>
  .self-analysis-tab {
    display: grid;
    gap: 8px;
  }

  .self-analysis-header,
  .self-analysis-strategy-column {
    display: flex;
    gap: 8px;
  }

  .subtitle {
    color: #6f6259;
    font-size: 12px;
    max-width: 760px;
  }

  .self-analysis-top-grid {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

  .self-analysis-bottom-grid {
    display: flex;
    align-items: stretch;
    flex: 1 1 0;
    gap: 8px;
    min-height: 0;
  }

  .overview-pane {
    flex: 0.3 1 0;
    min-width: 0;
    display: flex;
    align-items: stretch;
  }

  .right-pane {
    display: flex;
    flex-flow: column;
    gap: 8px;
    flex: 0.7 1 0;
    min-width: 0;
    min-height: 0;
  }

  .comparision-pane {
    display: flex;
    flex: 1 1 0;
    min-height: 0;
  }

  .self-analysis-evaluation-column {
    display: flex;
    flex-flow: column;
    gap: 8px;
    flex: 0.3 1 0;
    min-width: 0;
    min-height: 0;
  }

  .self-analysis-strategy-column {
    flex: 0.7;
  }

  @media (max-width: 1240px) {
    .self-analysis-top-grid,
    .self-analysis-bottom-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
