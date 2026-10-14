<script lang="ts">
  import type {
    PanoptesAnalysisSnapshotPayload,
    PanoptesPhaseTask,
    PanoptesPhaseTaskStatus,
    PanoptesProjectSummary,
    PanoptesStrategyPhase,
    PanoptesStrategyPlan
  } from '$lib/panoptes/types';
  import PanoptesCompetitorsTab from './competitors/PanoptesCompetitorsTab.svelte';
  import PanoptesIndustryTab from './industry/PanoptesIndustryTab.svelte';
  import PanoptesPanoaiTab from './panoai/PanoptesPanoaiTab.svelte';
  import PanoptesSelfTab from './self/PanoptesSelfTab.svelte';
  import PanoptesStrategyTab from './strategy/PanoptesStrategyTab.svelte';

  let {
    snapshot,
    activeTab = 'strategy',
    projects = [],
    selectedProjectId = null,
    selectedCompetitorId = null,
    onSelectCompetitor = () => {},
    selectedPlan = null,
    allStrategyTasks = [],
    selectedPhase = 'day_30',
    selectedTaskId = null,
    onSelectPhase = () => {},
    onSelectTask = () => {},
    onUpdateTaskStatus = () => {},
    onSelectStrategyKey = () => {},
    onSelectProject = () => {},
    onCreateProject = () => {},
    taskMutationStatus = 'idle',
    strategySelectionStatus = 'idle'
  }: {
    snapshot: PanoptesAnalysisSnapshotPayload;
    activeTab?: 'competitor' | 'industry' | 'self' | 'strategy' | 'panoai';
    projects?: PanoptesProjectSummary[];
    selectedProjectId?: string | null;
    selectedCompetitorId?: string | null;
    onSelectCompetitor?: (competitorId: string) => void;
    selectedPlan?: PanoptesStrategyPlan | null;
    allStrategyTasks?: PanoptesPhaseTask[];
    selectedPhase?: PanoptesStrategyPhase;
    selectedTaskId?: string | null;
    onSelectPhase?: (phase: PanoptesStrategyPhase) => void;
    onSelectTask?: (taskId: string | null) => void;
    onUpdateTaskStatus?: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
    onSelectStrategyKey?: (strategyKey: string) => void;
    onSelectProject?: (projectId: string) => void | Promise<void>;
    onCreateProject?: () => void;
    taskMutationStatus?: 'idle' | 'saving' | 'failed';
    strategySelectionStatus?: 'idle' | 'saving' | 'failed';
  } = $props();
</script>

<section class="snapshot-surface">
  <header class="surface-header">
    <div>
      <p class="eyebrow">Committed Snapshot</p>
      <h2>{snapshot.siteName}</h2>
    </div>
    <div class="meta">
      <span>{snapshot.versionLabel}</span>
      <span>{snapshot.meta.analyzedDateLabel}</span>
    </div>
  </header>

  {#if activeTab === 'competitor'}
    <PanoptesCompetitorsTab
      data={snapshot.competitors}
      {selectedCompetitorId}
      onSelectCompetitor={onSelectCompetitor}
    />
  {:else if activeTab === 'industry'}
    <PanoptesIndustryTab data={snapshot.industry} />
  {:else if activeTab === 'self'}
    <PanoptesSelfTab data={snapshot.self} siteName={snapshot.siteName} />
  {:else if activeTab === 'strategy'}
    <PanoptesStrategyTab
      strategy={snapshot.strategy}
      siteName={snapshot.siteName}
      projectDayCount={snapshot.meta.projectDayCount}
      {projects}
      {selectedProjectId}
      plans={snapshot.strategyPlans}
      {selectedPlan}
      allTasks={allStrategyTasks}
      {selectedPhase}
      {selectedTaskId}
      onSelectPhase={onSelectPhase}
      onSelectTask={onSelectTask}
      onUpdateTaskStatus={onUpdateTaskStatus}
      onSelectStrategyKey={onSelectStrategyKey}
      onSelectProject={onSelectProject}
      onCreateProject={onCreateProject}
      {taskMutationStatus}
      {strategySelectionStatus}
    />
  {:else}
    <PanoptesPanoaiTab data={snapshot.panoai} />
  {/if}
</section>

<style>
  .snapshot-surface {
    display: grid;
    gap: 8px;
  }

  .surface-header {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: end;
  }

  .eyebrow,
  h2,
  .meta {
    margin: 0;
  }

  .eyebrow {
    color: #ff6200;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    color: #403631;
    font-size: 24px;
  }

  .meta {
    display: flex;
    gap: 10px;
    color: #7b7067;
    font-size: 12px;
  }

  @media (max-width: 960px) {
    .surface-header {
      flex-direction: column;
      align-items: start;
    }
  }
</style>
