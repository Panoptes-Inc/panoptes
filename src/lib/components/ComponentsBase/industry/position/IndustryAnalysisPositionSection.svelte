<script lang="ts">
  import type { IndustryAnalysisViewModel } from '../data/industry-analysis-view-model';
  import IndustryPositionPanel from '../shared/position/IndustryPositionPanel.svelte';

  let { data }: { data: IndustryAnalysisViewModel } = $props();
</script>

<IndustryPositionPanel position={data.position} />
