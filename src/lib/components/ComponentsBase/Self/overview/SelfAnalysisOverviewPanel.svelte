<script lang="ts">
	import type { SelfAnalysisViewModel } from '../data/self-analysis-view-model';
	import SelfAnalysisOverviewEvidence from './SelfAnalysisOverviewEvidence.svelte';
	import SelfAnalysisOverviewSummary from './SelfAnalysisOverviewSummary.svelte';

	let { viewModel }: { viewModel: SelfAnalysisViewModel } = $props();
</script>

<section class="self-analysis-overview-panel">
	<SelfAnalysisOverviewSummary {viewModel} />
	<SelfAnalysisOverviewEvidence {viewModel} />
</section>

<style>
	.self-analysis-overview-panel {
		width: 100%;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 0 4px #00000016;
		padding: 8px;
		display: flex;
		flex-flow: column;
		gap: 8px;
		flex: 1;
	}
</style>
