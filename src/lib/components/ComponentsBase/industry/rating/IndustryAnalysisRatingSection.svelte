<script lang="ts">
  import type { IndustryAnalysisViewModel } from '../data/industry-analysis-view-model';
  import IndustryRatingPanel from '../shared/rating/IndustryRatingPanel.svelte';

  let { data }: { data: IndustryAnalysisViewModel } = $props();
</script>

<div class="ratingpanel">
  <IndustryRatingPanel rating={data.rating} />
</div>

<style>
  .ratingpanel {
    flex: 1;
  }
</style>