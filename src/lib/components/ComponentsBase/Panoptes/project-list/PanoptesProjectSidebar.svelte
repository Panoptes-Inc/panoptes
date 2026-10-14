<script lang="ts">
  import type { PanoptesProjectSummary } from '$lib/panoptes/types';
  import PanoptesProjectCard from './PanoptesProjectCard.svelte';
  import PanoptesProjectCreateCard from './PanoptesProjectCreateCard.svelte';

  let {
    projects = [],
    selectedProjectId = null,
    onSelectProject = () => {},
    onCreateProject = () => {}
  }: {
    projects?: PanoptesProjectSummary[];
    selectedProjectId?: string | null;
    onSelectProject?: (projectId: string) => void;
    onCreateProject?: () => void;
  } = $props();
</script>

<aside class="project-sidebar" aria-label="プロジェクト一覧">
  {#each projects as project (project.projectId)}
    <PanoptesProjectCard {project} selected={project.projectId === selectedProjectId} onSelect={onSelectProject} />
  {/each}

  <PanoptesProjectCreateCard onCreate={onCreateProject} />
</aside>

<style>
  .project-sidebar {
    display: grid;
    gap: 12px;
    align-content: start;
  }
</style>
