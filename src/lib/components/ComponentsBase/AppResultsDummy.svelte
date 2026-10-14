<script lang="ts">
  import PanoptesAppShellDummy from './dummy/PanoptesAppShellDummy.svelte';

  let {
    activePath = '/app'
  }: {
    activePath?: string;
  } = $props();
</script>

<PanoptesAppShellDummy {activePath} withHeader showHero={false} showSidebar={false} initialTab="competitor" />
