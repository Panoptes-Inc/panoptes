<script lang="ts">
  import IndustryAnalysisTab from '$lib/components/ComponentsBase/industry/IndustryAnalysisTab.svelte';
  import type { PanoptesIndustryData } from '$lib/panoptes/types';

  let {
    data,
    useDummyData = false
  }: {
    data: PanoptesIndustryData;
    useDummyData?: boolean;
  } = $props();
</script>

<IndustryAnalysisTab {data} {useDummyData} />
