<script lang="ts">
	import type {
		PanoptesAnalysisRuntimeStore,
		PanoptesAnalysisSnapshotPayload,
		PanoptesInferenceDraft,
		PanoptesMainSurfaceRenderMode,
		PanoptesPhaseTask,
		PanoptesPhaseTaskStatus,
		PanoptesProjectSummary,
		PanoptesStrategyPhase,
		PanoptesStrategyPlan
	} from '$lib/panoptes/types';
	import type { SnapshotTabId } from '../mapping/shell-view-model';
	import PanoptesAnalysisOverlay from '$lib/components/ComponentsBase/Panoptes/analysis/PanoptesAnalysisOverlay.svelte';
	import PanoptesAnalysisSurface from '$lib/components/ComponentsBase/Panoptes/analysis/PanoptesAnalysisSurface.svelte';
	import PanoptesSnapshotSurface from '$lib/components/ComponentsBase/Panoptes/snapshot/PanoptesSnapshotSurface.svelte';

	let {
		fallbackActive,
		renderMode,
		overlayMode,
		snapshot,
		activeTab,
		projects,
		selectedProjectId,
		selectedCompetitorId,
		selectedPlan,
		strategyTasks,
		selectedPhase,
		selectedTaskId,
		runtime,
		presentation,
		inferenceDraft,
		taskMutationStatus,
		strategySelectionStatus,
		onSelectCompetitor,
		onSelectPhase,
		onSelectTask,
		onUpdateTaskStatus,
		onSelectStrategyKey,
		onSelectProject,
		onCreateProject,
		onIndustryInput,
		onStructureInput,
		onScaleInput,
		onConfirm,
		onRetry
	}: {
		fallbackActive: boolean;
		renderMode: PanoptesMainSurfaceRenderMode;
		overlayMode: 'hidden' | 'showing_failure' | 'showing_waiting_confirmation' | 'showing_progress';
		snapshot: PanoptesAnalysisSnapshotPayload | null;
		activeTab: SnapshotTabId;
		projects: PanoptesProjectSummary[];
		selectedProjectId: string | null;
		selectedCompetitorId: string | null;
		selectedPlan: PanoptesStrategyPlan | null;
		strategyTasks: PanoptesPhaseTask[];
		selectedPhase: PanoptesStrategyPhase;
		selectedTaskId: string | null;
		runtime: PanoptesAnalysisRuntimeStore;
		presentation: { title: string; subtitle: string; showConfirmButton: boolean };
		inferenceDraft: PanoptesInferenceDraft | null;
		taskMutationStatus: 'idle' | 'saving' | 'failed';
		strategySelectionStatus: 'idle' | 'saving' | 'failed';
		onSelectCompetitor: (competitorId: string) => void;
		onSelectPhase: (phase: PanoptesStrategyPhase) => void;
		onSelectTask: (taskId: string | null) => void;
		onUpdateTaskStatus: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
		onSelectStrategyKey: (strategyKey: string) => void;
		onSelectProject: (projectId: string) => void | Promise<void>;
		onCreateProject: () => void;
		onIndustryInput: (value: string) => void;
		onStructureInput: (value: string) => void;
		onScaleInput: (value: string) => void;
		onConfirm: () => void;
		onRetry: () => void;
	} = $props();
</script>

{#snippet snapshotSurface()}
	{#if snapshot}
		<PanoptesSnapshotSurface
			{snapshot}
			{activeTab}
			{projects}
			{selectedProjectId}
			{selectedCompetitorId}
			onSelectCompetitor={onSelectCompetitor}
			{selectedPlan}
			allStrategyTasks={strategyTasks}
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
	{/if}
{/snippet}

<section class="main-column">
	{#if fallbackActive && snapshot}
		<div class="snapshot-stage debug-stage">{@render snapshotSurface()}</div>
	{:else if renderMode === 'empty_state'}
		<PanoptesAnalysisSurface variant="empty" onCreate={onCreateProject} />
	{:else if renderMode === 'analysis_flow'}
		<PanoptesAnalysisSurface
			variant="flow"
			{runtime}
			{presentation}
			{inferenceDraft}
			{onIndustryInput}
			{onStructureInput}
			{onScaleInput}
			{onConfirm}
			{onRetry}
		/>
	{:else if renderMode === 'failed_state'}
		<PanoptesAnalysisSurface variant="failed" {runtime} onRetry={onRetry} />
	{:else if snapshot}
		<div class="snapshot-stage">
			{@render snapshotSurface()}

			{#if overlayMode !== 'hidden'}
				<PanoptesAnalysisOverlay
					{runtime}
					{presentation}
					{inferenceDraft}
					{onIndustryInput}
					{onStructureInput}
					{onScaleInput}
					{onConfirm}
				/>
			{/if}
		</div>
	{/if}
</section>

<style>
	.main-column,
	.snapshot-stage {
		display: grid;
		gap: 14px;
	}

	.debug-stage {
		min-height: 720px;
	}
</style>
