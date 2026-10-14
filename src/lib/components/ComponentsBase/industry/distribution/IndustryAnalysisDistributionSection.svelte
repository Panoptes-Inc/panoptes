<script lang="ts">
  import type { IndustryAnalysisViewModel } from '../data/industry-analysis-view-model';
  import IndustryDistributionPanel from '../shared/distribution/IndustryDistributionPanel.svelte';

  let { data }: { data: IndustryAnalysisViewModel } = $props();
</script>

<IndustryDistributionPanel distribution={data.distribution} />
