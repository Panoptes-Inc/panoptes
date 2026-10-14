<script lang="ts">
	import type { SelfAnalysisViewModel } from '../data/self-analysis-view-model';

	let { viewModel }: { viewModel: SelfAnalysisViewModel } = $props();
</script>

<div class="insight-grid">
	<article class="list-card">
		<h3>強み TOP3</h3>
		<ol>
			{#each viewModel.strengths as item, index (index)}
				<li>・{item}</li>
			{/each}
		</ol>
	</article>

	<article class="list-card">
		<h3>課題 TOP3</h3>
		<ol>
			{#each viewModel.issues as item, index (index)}
				<li>・{item}</li>
			{/each}
		</ol>
	</article>
</div>

<article class="breakdown-card">
	<header>
		<h3>構造内訳</h3>
		<span>項目 / スコア / 所見</span>
	</header>

	<div class="breakdown-table">
		{#each viewModel.breakdownRows as row, index (index)}
			<div class="table-row">
				<strong>{row.label}</strong>
				<span class="score-cell">{row.score}</span>
				<p>{row.finding}</p>
			</div>
		{/each}
	</div>
</article>

<article class="ai-card">
	<span>AI評価</span>
	<p>{viewModel.aiSummary}</p>
</article>

<style>
	.insight-grid {
		display: flex;
		gap: 8px;
		flex: 1;
	}

	.list-card,
	.breakdown-card,
	.ai-card {
		width: 100%;
		border-radius: 8px;
		background: #fff;
		padding: 8px;
		flex: 1;
		display: flex;
		flex-flow: column;
		gap: 8px;
		box-shadow: 0 0 4px #00000016;
	}

	.list-card h3,
	.breakdown-card h3,
	.breakdown-card header span,
	.ai-card span {
		margin: 0;
		color: #7b6d63;
		font-size: 12px;
		font-weight: 700;
	}

	.list-card h3 {
		color: #ff6d1d;
		font-size: 14px;
	}

	.list-card ol {
		margin: 0;
		color: #6d5f56;
		font-size: 12px;
	}

	.list-card {
		gap: 2px;
	}

	.breakdown-card header {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: baseline;
	}

	.breakdown-table {
		display: grid;
	}

	.table-row {
		display: grid;
		grid-template-columns: minmax(110px, 0.9fr) 72px minmax(0, 1.2fr);
		gap: 8px;
		align-items: center;
		padding: 8px 0;
		border-top: 1px solid #f4ece4;
	}

	.table-row:first-child {
		border-top: 0;
	}

	.table-row strong,
	.table-row p {
		margin: 0;
		color: #4e4037;
		font-size: 12px;
	}

	.score-cell {
		justify-self: start;
		border-radius: 999px;
		background: rgba(255, 109, 29, 0.1);
		color: #ff6d1d;
		padding: 5px 10px;
		font-size: 12px;
		font-weight: 800;
	}

	.ai-card span {
		color: #7f79ff;
	}

	.ai-card p {
		margin: 0;
		color: #695b52;
		font-size: 12px;
	}

	@media (max-width: 1220px) {
		.insight-grid,
		.table-row {
			grid-template-columns: 1fr;
		}
	}
</style>
