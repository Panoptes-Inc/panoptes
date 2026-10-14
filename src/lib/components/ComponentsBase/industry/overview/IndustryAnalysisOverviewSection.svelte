<script lang="ts">
  import type { IndustryAnalysisViewModel } from '../data/industry-analysis-view-model';
  import IndustryOverviewMarketTypeCard from '../shared/overview/IndustryOverviewMarketTypeCard.svelte';
  import IndustryOverviewSignalPills from '../shared/overview/IndustryOverviewSignalPills.svelte';
  import IndustryOverviewUpdatedStamp from '../shared/overview/IndustryOverviewUpdatedStamp.svelte';

  let { data }: { data: IndustryAnalysisViewModel } = $props();
</script>

<section class="overview-grid">
  <IndustryOverviewMarketTypeCard marketType={data.marketType} />

  <div class="overview-side">
    <IndustryOverviewSignalPills signals={data.signals} />
  </div>
</section>

<style>
  .overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
    gap: 16px;
    align-items: start;
  }

  .overview-side {
    display: grid;
    gap: 10px;
    align-content: start;
  }

  @media (max-width: 1360px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
