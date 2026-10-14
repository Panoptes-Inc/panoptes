<script lang="ts">
	import type { SelfAnalysisViewModel } from '../data/self-analysis-view-model';
	import SelfAnalysisDualRingGauge from './SelfAnalysisDualRingGauge.svelte';

	let { viewModel }: { viewModel: SelfAnalysisViewModel } = $props();
</script>

<div class="overview-top">
	<div class="gauge-campany">
		<div class="gauge-column">
			<SelfAnalysisDualRingGauge
				centerScore={viewModel.overallScore}
				outerScore={viewModel.internalScore}
				innerScore={viewModel.visualScore}
			/>
		</div>
		<div class="company-block">
			<p class="eyebrow">Current Snapshot</p>
			<h2>{viewModel.serviceName}</h2>
		</div>
	</div>

	<div class="summary-column">
		<div class="market-type-pill">{viewModel.marketTypeLabel}</div>
		<div class="score-grid">
			<article class="score-card" aria-label={`内部構造スコア ${viewModel.internalScore}`}>
				<span>内部構造スコア</span>
				<strong>{viewModel.internalScore}</strong>
				<small>業界基準 {viewModel.industryBenchmarkScore}</small>
			</article>
			<article
				class="score-card score-card-violet"
				aria-label={`ビジュアルスコア ${viewModel.visualScore}`}
			>
				<span>ビジュアルスコア</span>
				<strong>{viewModel.visualScore}</strong>
				<small>業界基準 {viewModel.industryBenchmarkScore}</small>
			</article>
		</div>
		<article class="badge-card">
			<span>業界平均との差分</span>
			<div class="badge-list">
				{#each viewModel.deltaBadges as badge, index (index)}
					<small class:negative={badge.tone === 'negative'}>
						{badge.label} : {badge.displayValue}
					</small>
				{/each}
			</div>
		</article>
	</div>
</div>

<style>
	.overview-top {
		display: flex;
		gap: 14px;
		align-items: stretch;
	}

	.gauge-column {
		display: flex;
		place-items: center;
	}

	.summary-column {
		display: flex;
		gap: 10px;
		flex-flow: column;
		flex: 1;
	}

	.company-block {
		display: flex;
		flex-flow: column;
		gap: 4px;
	}

	.company-block .eyebrow,
	.company-block h2 {
		margin: 0;
	}

	.company-block .eyebrow {
		color: #7f79ff;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.company-block h2 {
		color: #3e322d;
		font-size: 24px;
	}

	.market-type-pill {
		border-radius: 8px;
		background: #fff;
		padding: 8px;
		color: #ff6e1d;
		font-size: 16px;
		font-weight: 800;
		box-shadow: 0 0 4px #00000016;
	}

	.score-grid {
		display: flex;
		gap: 8px;
		flex: 1;
	}

	.score-card,
	.badge-card {
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

	.score-card span,
	.badge-card span {
		margin: 0;
		color: #7b6d63;
		font-size: 12px;
		font-weight: 700;
	}

	.score-card strong {
		color: #ff6d1d;
		font-size: 24px;
		line-height: 1;
	}

	.score-card-violet strong {
		color: #7f79ff;
	}

	.score-card small {
		color: #948578;
		font-size: 13px;
	}

	.badge-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.badge-list small {
		border-radius: 999px;
		background: #ece8ff;
		color: #7369ff;
		padding: 2px 6px;
		font-size: 12px;
		font-weight: 700;
	}

	.badge-list small.negative {
		background: #fff0e5;
		color: #ff6d1d;
	}

	@media (max-width: 1220px) {
		.overview-top,
		.score-grid {
			grid-template-columns: 1fr;
		}

		.gauge-column {
			justify-items: start;
		}
	}
</style>
