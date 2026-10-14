<script lang="ts">
  import CompetitorAnalysisTab from '$lib/components/ComponentsBase/Competitor/CompetitorAnalysisTab.svelte';
  import type { PanoptesAnalysisSnapshotPayload } from '$lib/panoptes/types';

  let {
    data,
    selectedCompetitorId = null,
    onSelectCompetitor = () => {}
  }: {
    data: PanoptesAnalysisSnapshotPayload['competitors'];
    selectedCompetitorId?: string | null;
    onSelectCompetitor?: (competitorId: string) => void;
  } = $props();

</script>

<CompetitorAnalysisTab {data} {selectedCompetitorId} onSelectCompetitor={onSelectCompetitor} />
