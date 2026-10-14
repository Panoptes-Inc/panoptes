<script lang="ts">
	import type { CompetitorAnalysisCardViewModel } from '../data/competitor-analysis-view-model';
	import { createCompetitorExpandedActionLabels } from '../data/competitor-card-presentation';
	import CompetitorAnalysisEvidenceSections from './CompetitorAnalysisEvidenceSections.svelte';
	import CompetitorAnalysisExpandedMetrics from './CompetitorAnalysisExpandedMetrics.svelte';

	let {
		card,
		compared = false,
		onOpenDetail = () => {},
		onOpenCompare = () => {}
	}: {
		card: CompetitorAnalysisCardViewModel;
		compared?: boolean;
		onOpenDetail?: (competitorId: string) => void;
		onOpenCompare?: (competitorId: string) => void;
	} = $props();

	const actionLabels = $derived(createCompetitorExpandedActionLabels(compared));
</script>

<article class="expanded-card">
	<header class="header">
		<div class="title-copy">
			<h3>{card.companyName} | {card.serviceName}</h3>

			{#if card.url}
				<a
					href={card.url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${card.companyName}の外部サイトを新しいタブで開く`}
				>
					URLを開く
				</a>
			{/if}

			<div class="badge-row">
				{#each card.descriptorBadges as badge, index (index)}
					<span>{badge}</span>
				{/each}
			</div>
		</div>
	</header>

	<CompetitorAnalysisExpandedMetrics {card} />

	<CompetitorAnalysisEvidenceSections
		detailSummary={card.detailSummary}
		insightLines={card.insightLines}
		actionLines={card.actionLines}
	/>

	<footer class="footer-actions">
		<button type="button" class="detail" onclick={() => onOpenDetail(card.competitorId)}>
			{actionLabels.detail}
		</button>
		<button type="button" class="compare" onclick={() => onOpenCompare(card.competitorId)}>
			{actionLabels.compare}
		</button>
	</footer>
</article>

<style>
	.expanded-card {
		width: min(100%, 430px);
		min-width: 0;
		flex: 0 0 min(100%, 430px);
		min-height: 100%;
		padding: 8px;
		border-radius: 8px;
		box-shadow: 0 0 4px #00000016;
		background: #fff;
		display: flex;
		flex-flow: column;
		gap: 8px;
	}

	.header {
		display: grid;
		gap: 8px;
	}

	.title-copy {
		display: grid;
		gap: 8px;
		min-width: 0;
	}

	h3 {
		margin: 0;
		color: #443a33;
		font-size: 16px;
	}

	.title-copy a {
		justify-self: start;
		color: #6d63e8;
		font-size: 12px;
		font-weight: 700;
	}

	.badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.badge-row span {
		padding: 4px 8px;
		border-radius: 999px;
		background: #f2f0ff;
		color: #7d73ff;
		font-size: 11px;
		font-weight: 500;
	}

	.footer-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}

	.footer-actions button {
		min-height: 36px;
		border: 0;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}

	.footer-actions .detail {
		background: linear-gradient(180deg, #ffb17a, #ff8b43);
		color: #fff;
	}

	.footer-actions .compare {
		background: linear-gradient(180deg, #d1cbff, #b6adff);
		color: #fff;
	}

	@media (max-width: 720px) {
		.expanded-card {
			width: 100%;
		}
	}
</style>
