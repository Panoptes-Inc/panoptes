<script lang="ts">
  import PanoptesShellEntryPage from '$lib/components/ComponentsBase/PanoptesShellEntryPage.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<PanoptesShellEntryPage organizationId={data.activeOrganizationId} />
