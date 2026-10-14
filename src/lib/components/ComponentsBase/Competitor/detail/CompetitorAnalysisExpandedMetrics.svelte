<script lang="ts">
	import {
		createCompetitorExpandedScoreRing,
		formatCompetitorScorePercentage
	} from '../data/competitor-card-presentation';
	import type { CompetitorAnalysisCardViewModel } from '../data/competitor-analysis-view-model';
	import CompetitorAnalysisRadarChart from './CompetitorAnalysisRadarChart.svelte';

	let { card }: { card: CompetitorAnalysisCardViewModel } = $props();

	const scoreRing = $derived(createCompetitorExpandedScoreRing(card.overallScore));
</script>

<div class="hero-row">
	<div class="score-ring" style:background={scoreRing} role="img" aria-label={`総合スコア ${card.overallScore}`}>
		<div class="score-ring-inner">{card.overallScore}</div>
	</div>

	<div class="hero-meta">
		<div class="meta-item">
			<span class="meta-label">市場タイプ</span>
			<strong>{card.marketTypeLabel}</strong>
		</div>
		<div class="meta-item">
			<span class="meta-label">比較検討期</span>
			<strong>{card.considerationPeriodLabel}</strong>
		</div>
		<div class="meta-item">
			<span class="meta-label">導線構造タイプ</span>
			<strong>{card.funnelTypeLabel}</strong>
		</div>
		<div class="meta-item">
			<span class="meta-label">必須要素</span>
			<strong>{card.mustElementLabels.join(' / ')}</strong>
		</div>
	</div>
</div>

<div class="score-stack">
	<div class="score-item">
		<span class="score-label">内部構造スコア</span>
		<div class="score-bar">
			<strong>{card.internalStructureScore}</strong>
			<div class="bar-track">
				<div
					class="bar-fill orange"
					style:width={formatCompetitorScorePercentage(card.internalStructureScore)}
				></div>
			</div>
		</div>
	</div>

	<div class="score-item">
		<span class="score-label">ビジュアルスコア</span>
		<div class="score-bar">
			<strong>{card.visualScore}</strong>
			<div class="bar-track">
				<div
					class="bar-fill violet"
					style:width={formatCompetitorScorePercentage(card.visualScore)}
				></div>
			</div>
		</div>
	</div>
</div>

<CompetitorAnalysisRadarChart points={card.radarPoints} />

<style>
	.hero-row {
		display: grid;
		gap: 8px;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
	}

	.score-ring {
		width: 126px;
		height: 126px;
		border-radius: 999px;
		padding: 8px;
		display: grid;
		place-items: center;
	}

	.score-ring-inner {
		width: 100%;
		height: 100%;
		border-radius: inherit;
		background: #fff;
		display: grid;
		place-items: center;
		color: #4b413a;
		font-size: 28px;
		font-weight: 800;
	}

	.hero-meta {
		display: grid;
		gap: 8px;
		min-width: 0;
	}

	.meta-item {
		padding: 8px;
		border-radius: 8px;
		box-shadow: 0 0 4px #00000016;
		background: #fff;
		display: flex;
		gap: 4px;
		min-width: 0;
	}

	.meta-item .meta-label {
		color: #8a7f76;
		font-size: 11px;
		font-weight: 500;
		flex: 0 0 auto;
	}

	.meta-item strong {
		color: #4b413a;
		font-size: 12px;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.score-stack {
		display: flex;
		flex: 1;
		gap: 12px;
		width: 100%;
	}

	.score-item {
		display: flex;
		flex-flow: column;
		gap: 5px;
		flex: 1;
	}

	.score-bar {
		display: flex;
		flex-flow: row;
		align-items: center;
	}

	.score-item .score-label {
		color: #5c5047;
		font-size: 12px;
		font-weight: 700;
	}

	.score-item strong {
		color: #ff7a1a;
		font-size: 13px;
		width: 100%;
		flex: 0.1;
	}

	.bar-track {
		height: 7px;
		border-radius: 999px;
		background: #f2e7df;
		flex: 0.9;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: inherit;
	}

	.bar-fill.orange {
		background: linear-gradient(90deg, #ffb17a, #ff7a1a);
	}

	.bar-fill.violet {
		background: linear-gradient(90deg, #cbc5ff, #7d73ff);
	}

	@media (max-width: 720px) {
		.hero-row,
		.score-stack {
			width: 100%;
			grid-template-columns: 1fr;
		}

		.score-ring {
			justify-self: center;
		}
	}
</style>
