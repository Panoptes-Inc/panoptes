<script lang="ts">
	import type { PanoptesPhaseTaskStatus, PanoptesStrategyPhase } from '$lib/panoptes/types';
	import type { StrategyAnalysisRoadmapPhaseModel } from '../data/strategy-analysis-view-model';
	import StrategyAnalysisRoadmapStatusActions from './StrategyAnalysisRoadmapStatusActions.svelte';
	import StrategyAnalysisRoadmapTaskList from './StrategyAnalysisRoadmapTaskList.svelte';

	let {
		phaseCard,
		selectedPhase,
		taskMutationStatus = 'idle',
		onSelectPhase = () => {},
		onSelectTask = () => {},
		onUpdateTaskStatus = () => {}
	}: {
		phaseCard: StrategyAnalysisRoadmapPhaseModel;
		selectedPhase: PanoptesStrategyPhase;
		taskMutationStatus?: 'idle' | 'saving' | 'failed';
		onSelectPhase?: (phase: PanoptesStrategyPhase) => void;
		onSelectTask?: (taskId: string | null) => void;
		onUpdateTaskStatus?: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
	} = $props();

	const isSelected = $derived(phaseCard.phase === selectedPhase);
</script>

<article class:selected={isSelected} class="strategy-roadmap-phase-card">
	<button
		type="button"
		class="phase-header"
		aria-pressed={isSelected}
		onclick={() => onSelectPhase(phaseCard.phase)}
	>
		<h3>{phaseCard.title}</h3>
		<p>{phaseCard.objective}</p>
	</button>

	<div class="phase-body">
		<section class="phase-summary">
			<div class="summary-block">
				<span>目的</span>
				<p>{phaseCard.objective}</p>
			</div>

			<div class="summary-block">
				<span>進捗</span>
				<strong>{phaseCard.progressLabel}</strong>
				<small>着手: {phaseCard.progressCountLabel}</small>
			</div>

			<div class="summary-block">
				<span>次のアクション</span>
				<p>{phaseCard.nextAction}</p>
			</div>
		</section>

		<StrategyAnalysisRoadmapTaskList
			tasks={phaseCard.tasks}
			{taskMutationStatus}
			{onSelectTask}
			{onUpdateTaskStatus}
		/>
	</div>

	{#if isSelected && phaseCard.activeTask}
		<StrategyAnalysisRoadmapStatusActions
			activeTask={phaseCard.activeTask}
			{taskMutationStatus}
			{onUpdateTaskStatus}
		/>
	{/if}
</article>

<style>
	.strategy-roadmap-phase-card {
		border-radius: 8px;
		background: linear-gradient(180deg, #ffffff, #fffaf6);
		box-shadow: 0 0 4px #00000016;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.strategy-roadmap-phase-card.selected {
		border-color: #ffb37e;
		box-shadow: 0 0 0 2px rgba(255, 143, 67, 0.12);
	}

	.phase-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 0;
		border: 0;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.phase-header h3,
	.phase-header p,
	.summary-block span,
	.summary-block p,
	.summary-block strong,
	.summary-block small {
		margin: 0;
	}

	.phase-header h3 {
		color: #ff6d1d;
		font-size: 20px;
		line-height: 1;
	}

	.phase-header p {
		color: #696969;
		font-size: 12px;
		font-weight: 400;
	}

	.phase-body {
		display: flex;
		flex-flow: row;
		gap: 4px;
		align-items: start;
	}

	.phase-summary {
		flex: 1 1 180px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.summary-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.summary-block span {
		color: #786a61;
		font-size: 12px;
		font-weight: 700;
	}

	.summary-block p {
		color: #6d5f56;
		font-size: 12px;
		line-height: 1.65;
	}

	.summary-block strong {
		color: #6d5eff;
		font-size: 13px;
	}

	.summary-block small {
		color: #8b7e74;
		font-size: 12px;
		font-weight: 700;
	}

	@media (max-width: 1180px) {
		.phase-summary {
			flex-basis: 100%;
		}
	}
</style>
