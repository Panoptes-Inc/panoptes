<script lang="ts">
  import type { PanoptesIndustryData } from '$lib/panoptes/types';
  import { createIndustryAnalysisViewModel, dummyIndustryAnalysisViewModel } from './data/industry-analysis-view-model';
  import IndustryAnalysisDistributionSection from './distribution/IndustryAnalysisDistributionSection.svelte';
  import IndustryAnalysisOpportunitySection from './opportunity/IndustryAnalysisOpportunitySection.svelte';
  import IndustryAnalysisOverviewSection from './overview/IndustryAnalysisOverviewSection.svelte';
  import IndustryAnalysisPositionSection from './position/IndustryAnalysisPositionSection.svelte';
  import IndustryAnalysisRatingSection from './rating/IndustryAnalysisRatingSection.svelte';

  let {
    data = null,
    useDummyData = false
  }: {
    data?: PanoptesIndustryData | null;
    useDummyData?: boolean;
  } = $props();

  const viewModel = $derived(useDummyData || !data ? dummyIndustryAnalysisViewModel : createIndustryAnalysisViewModel({ data }));
</script>

<article class="industry-analysis-tab" aria-label="業界分析タブ">
  <IndustryAnalysisOverviewSection data={viewModel} />

  <div class="industry-middle-grid">
    <IndustryAnalysisRatingSection data={viewModel} />
    <IndustryAnalysisPositionSection data={viewModel} />
  </div>

  <div class="industry-bottom-grid">
    <IndustryAnalysisDistributionSection data={viewModel} />
    <IndustryAnalysisOpportunitySection data={viewModel} />
  </div>
</article>

<style>
  .industry-analysis-tab {
    --industry-panel-bg: linear-gradient(180deg, #ffffff, #fffaf4);
    --industry-panel-border: rgba(215, 207, 198, 0.92);
    --industry-panel-shadow: 0 0 4px #00000016;
    --industry-text: #3f3832;
    --industry-muted: #7b7269;
    --industry-orange: #ff6a00;
    --industry-violet: #7771ff;

    display: flex;
    flex-flow: column;
    gap: 8px;
    color: var(--industry-text);
    align-items: stretch;
  }

  .industry-middle-grid,
  .industry-bottom-grid {
    display: flex;
    flex-flow: row;
    gap: 8px;
    align-items: stretch;
  }

  @media (max-width: 1360px) {
    .industry-middle-grid,
    .industry-bottom-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
