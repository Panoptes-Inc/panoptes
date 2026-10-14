<script lang="ts">
  import type { PanoptesProjectSummary } from '$lib/panoptes/types';
  import PanoptesProjectSidebar from '$lib/components/ComponentsBase/Panoptes/project-list/PanoptesProjectSidebar.svelte';

  let {
    projects = [],
    selectedProjectId = null,
    onSelectProject = () => {},
    onCreateProject = () => {}
  }: {
    projects?: PanoptesProjectSummary[];
    selectedProjectId?: string | null;
    onSelectProject?: (projectId: string) => void | Promise<void>;
    onCreateProject?: () => void;
  } = $props();
</script>

<aside class="strategy-project-rail">
  <header class="rail-header">
    <h3>Projects</h3>
  </header>

  <div class="rail-shell">
    <PanoptesProjectSidebar {projects} {selectedProjectId} {onSelectProject} {onCreateProject} />
  </div>
</aside>

<style>
  .strategy-project-rail {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .rail-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .rail-header h3 {
    margin: 0;
    color: #3f342e;
    font-size: 18px;
  }

  .rail-shell {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
</style>
