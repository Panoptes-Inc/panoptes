<script lang="ts">
  import type {
    PanoptesPhaseTask,
    PanoptesPhaseTaskStatus,
    PanoptesProjectSummary,
    PanoptesStrategyData,
    PanoptesStrategyPhase,
    PanoptesStrategyPlan
  } from '$lib/panoptes/types';
  import { createStrategyAnalysisViewModel } from './data/strategy-analysis-view-model';
  import StrategyAnalysisImprovementSection from './improvement/StrategyAnalysisImprovementSection.svelte';
  import StrategyAnalysisProgressOverviewPanel from './overview/StrategyAnalysisProgressOverviewPanel.svelte';
  import StrategyAnalysisProjectRail from './rail/StrategyAnalysisProjectRail.svelte';
  import StrategyAnalysisRoadmapSection from './roadmap/StrategyAnalysisRoadmapSection.svelte';

  let {
    strategy,
    siteName = 'OOサービス',
    projectDayCount = 24,
    projects = [],
    selectedProjectId = null,
    plans = [],
    selectedPlan = null,
    allTasks = [],
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
    strategy: PanoptesStrategyData;
    siteName?: string;
    projectDayCount?: number;
    projects?: PanoptesProjectSummary[];
    selectedProjectId?: string | null;
    plans?: PanoptesStrategyPlan[];
    selectedPlan?: PanoptesStrategyPlan | null;
    allTasks?: PanoptesPhaseTask[];
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

  const viewModel = $derived(
    createStrategyAnalysisViewModel({
      strategy,
      siteName,
      projectDayCount,
      plans,
      selectedPlan,
      allTasks,
      selectedPhase,
      selectedTaskId
    })
  );
</script>

<section class="strategy-analysis-tab">
  <div class="strategy-top-grid">
    <div class="overview-improvement">
      <div class="top-pane top-pane-overview">
        <StrategyAnalysisProgressOverviewPanel overview={viewModel.overview} />
      </div>
      <div class="top-pane top-pane-improvement">
        <StrategyAnalysisImprovementSection improvement={viewModel.improvement} />
      </div>
    </div>
    <StrategyAnalysisRoadmapSection
    roadmap={viewModel.roadmap}
    {taskMutationStatus}
    {onSelectPhase}
    {onSelectTask}
    {onUpdateTaskStatus}
   />
  </div>
  <div class="top-pane top-pane-projects">
    <StrategyAnalysisProjectRail {projects} {selectedProjectId} {onSelectProject} {onCreateProject} />
  </div>
</section>

<style>
  .strategy-analysis-tab {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .overview-improvement {
    display: flex;
    flex-flow: row nowrap;
    gap: 8px;
    align-items: stretch;
  }

  .strategy-top-grid {
    display: flex;
    flex-wrap: nowrap;
    flex-flow: column;
    gap: 8px;
  }

  .top-pane {
    min-width: 0;
    display: flex;
    align-items: stretch;
  }

  .top-pane-overview {
    flex: 1 1 0;
  }

  .top-pane-improvement {
    flex: 1 1 0;
  }

  .top-pane-projects {
    width: 480px;
  }

  @media (max-width: 1380px) {
    .top-pane {
      flex-basis: 100%;
    }
  }
</style>
