<script lang="ts">
  import type {
    PanoptesPhaseTask,
    PanoptesPhaseTaskStatus,
    PanoptesProjectSummary,
    PanoptesStrategyData,
    PanoptesStrategyPhase,
    PanoptesStrategyPlan
  } from '$lib/panoptes/types';
  import StrategyAnalysisTab from '$lib/components/ComponentsBase/Strategy/StrategyAnalysisTab.svelte';

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
</script>

<StrategyAnalysisTab
  {strategy}
  {siteName}
  {projectDayCount}
  {projects}
  {selectedProjectId}
  {plans}
  {selectedPlan}
  {allTasks}
  {selectedPhase}
  {selectedTaskId}
  {onSelectPhase}
  {onSelectTask}
  {onUpdateTaskStatus}
  {onSelectStrategyKey}
  {onSelectProject}
  {onCreateProject}
  {taskMutationStatus}
  {strategySelectionStatus}
/>
