<script lang="ts">
  import { dummySnapshot } from '$lib/db/dummy/panoptes_dummy_ui';
  import type { PanoptesAnalysisSnapshotPayload } from '$lib/panoptes/types';
  import PanoptesShellPage from './Panoptes/PanoptesShellPage.svelte';

  let {
    fallbackSnapshot = dummySnapshot,
    organizationId = null
  }: {
    fallbackSnapshot?: PanoptesAnalysisSnapshotPayload | null;
    organizationId?: string | null;
  } = $props();
</script>

<PanoptesShellPage {fallbackSnapshot} {organizationId} />
