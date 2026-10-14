<script lang="ts">
  import type { IndustryAnalysisViewModel } from '../data/industry-analysis-view-model';
  import IndustryOpportunityPanel from '../shared/opportunity/IndustryOpportunityPanel.svelte';

  let { data }: { data: IndustryAnalysisViewModel } = $props();
</script>

<IndustryOpportunityPanel opportunity={data.opportunity} />
