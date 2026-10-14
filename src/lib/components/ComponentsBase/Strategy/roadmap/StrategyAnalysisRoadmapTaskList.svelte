<script lang="ts">
	import type { PanoptesPhaseTaskStatus } from '$lib/panoptes/types';
	import {
		nextChecklistTaskStatus,
		roadmapTaskStatusTone
	} from '../data/roadmap-phase-presentation';
	import type { StrategyAnalysisRoadmapTaskModel } from '../data/strategy-analysis-view-model';

	let {
		tasks,
		taskMutationStatus = 'idle',
		onSelectTask = () => {},
		onUpdateTaskStatus = () => {}
	}: {
		tasks: StrategyAnalysisRoadmapTaskModel[];
		taskMutationStatus?: 'idle' | 'saving' | 'failed';
		onSelectTask?: (taskId: string | null) => void;
		onUpdateTaskStatus?: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
	} = $props();

	function toggleChecklistTask(task: StrategyAnalysisRoadmapTaskModel): void {
		onSelectTask(task.phaseTaskId);
		onUpdateTaskStatus(task.phaseTaskId, nextChecklistTaskStatus(task.status));
	}
</script>

<section class="checklist-card">
	<div class="checklist-header">
		<strong>タスク</strong>
		<span>{tasks.length}件</span>
	</div>

	<div class="checklist-items">
		{#each tasks as task (task.phaseTaskId)}
			<div class:active={task.isActive} class="checklist-item">
				<button
					type="button"
					class:checked={task.isChecked}
					class="checkbox-button"
					disabled={taskMutationStatus === 'saving'}
					aria-label={`${task.title} を ${task.isChecked ? '未完了' : '完了'}にする`}
					onclick={() => toggleChecklistTask(task)}
				>
					<span class="checkbox-inner"></span>
				</button>

				<button
					type="button"
					class="task-copy"
					aria-pressed={task.isActive}
					onclick={() => onSelectTask(task.phaseTaskId)}
				>
					<div class="task-head">
						<strong>{task.title}</strong>
						<em style:color={roadmapTaskStatusTone(task.status)}>{task.statusLabel}</em>
					</div>

					{#if task.description}
						<p>{task.description}</p>
					{/if}

					{#if task.ownerLabel || task.dueHint}
						<small>
							{#if task.ownerLabel}
								<span>{task.ownerLabel}</span>
							{/if}
							{#if task.dueHint}
								<span>{task.dueHint}</span>
							{/if}
						</small>
					{/if}
				</button>
			</div>
		{/each}
	</div>
</section>

<style>
	.checklist-card {
		border-radius: 14px;
		border: 1px solid #ffb178;
		background: #fff;
		padding: 10px;
		flex: 1 1 220px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.checklist-header {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		align-items: center;
	}

	.checklist-header strong,
	.checklist-header span,
	.task-head strong,
	.task-head em,
	.task-copy p,
	.task-copy small {
		margin: 0;
	}

	.checklist-header strong {
		color: #5a4b42;
		font-size: 13px;
	}

	.checklist-header span {
		color: #ff7a22;
		font-size: 11px;
		font-weight: 700;
	}

	.checklist-items {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.checklist-item {
		display: flex;
		gap: 8px;
		align-items: start;
	}

	.checklist-item.active .task-copy {
		background: #fff6ef;
		border-color: #ffb178;
	}

	.checkbox-button,
	.task-copy {
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
	}

	.checkbox-button {
		width: 16px;
		height: 16px;
		border-radius: 6px;
		border: 1.5px solid #d8c7b8;
		margin-top: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		flex: 0 0 16px;
	}

	.checkbox-button.checked {
		border-color: #ff7a22;
		background: #fff3eb;
	}

	.checkbox-inner {
		width: 8px;
		height: 8px;
		border-radius: 3px;
		background: transparent;
	}

	.checkbox-button.checked .checkbox-inner {
		background: linear-gradient(135deg, #ffb783, #ff7a22);
	}

	.task-copy {
		width: 100%;
		text-align: left;
		border-radius: 12px;
		border: 1px solid #f1e5da;
		background: #fffcfa;
		padding: 8px 10px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.task-head {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		align-items: baseline;
	}

	.task-head strong {
		color: #4b3d35;
		font-size: 12px;
		line-height: 1.45;
	}

	.task-head em {
		font-style: normal;
		font-size: 10px;
		font-weight: 800;
		white-space: nowrap;
	}

	.task-copy p {
		color: #8a7d74;
		font-size: 10px;
		line-height: 1.55;
	}

	.task-copy small {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		color: #93867d;
		font-size: 10px;
		font-weight: 700;
	}

	@media (max-width: 1180px) {
		.checklist-card {
			flex-basis: 100%;
		}
	}
</style>
