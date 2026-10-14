<script lang="ts">
  import SelfAnalysisTab from '$lib/components/ComponentsBase/Self/SelfAnalysisTab.svelte';
  import type { PanoptesSelfData } from '$lib/panoptes/types';

  let {
    data,
    siteName = '自社サイト'
  }: {
    data: PanoptesSelfData;
    siteName?: string;
  } = $props();
</script>

<SelfAnalysisTab {data} {siteName} />
