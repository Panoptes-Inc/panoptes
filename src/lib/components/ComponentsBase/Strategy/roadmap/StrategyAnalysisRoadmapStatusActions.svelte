<script lang="ts">
	import type { PanoptesPhaseTaskStatus } from '$lib/panoptes/types';
	import {
		ROADMAP_TASK_STATUS_ACTIONS,
		roadmapStatusActionLabel
	} from '../data/roadmap-phase-presentation';
	import type { StrategyAnalysisRoadmapTaskModel } from '../data/strategy-analysis-view-model';

	let {
		activeTask,
		taskMutationStatus = 'idle',
		onUpdateTaskStatus = () => {}
	}: {
		activeTask: StrategyAnalysisRoadmapTaskModel;
		taskMutationStatus?: 'idle' | 'saving' | 'failed';
		onUpdateTaskStatus?: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
	} = $props();
</script>

<div class="status-actions">
	{#each ROADMAP_TASK_STATUS_ACTIONS as status (status)}
		<button
			type="button"
			class:active={status === activeTask.status}
			disabled={taskMutationStatus === 'saving'}
			aria-pressed={status === activeTask.status}
			onclick={() => onUpdateTaskStatus(activeTask.phaseTaskId, status)}
		>
			{roadmapStatusActionLabel(status)}
		</button>
	{/each}
</div>

<style>
	.status-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.status-actions button {
		border: 0;
		border-radius: 999px;
		background: #f5eee9;
		color: #68594f;
		padding: 7px 10px;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
	}

	.status-actions button.active {
		background: linear-gradient(135deg, #ffb67f, #ff7c24);
		color: #fff;
	}
</style>
