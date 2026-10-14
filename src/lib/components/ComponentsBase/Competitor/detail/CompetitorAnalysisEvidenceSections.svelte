<script lang="ts">
	let {
		detailSummary,
		insightLines = [],
		actionLines = []
	}: {
		detailSummary: string;
		insightLines?: string[];
		actionLines?: string[];
	} = $props();
</script>

<section class="summary-section">
	<h4>AI評価</h4>
	<p>{detailSummary}</p>
</section>

<div class="detail-columns">
	<section class="detail-list">
		<h4>観察インサイト</h4>
		<ul>
			{#each insightLines as line, index (index)}
				<li>{line}</li>
			{/each}
		</ul>
	</section>

	<section class="detail-list">
		<h4>推奨アクション</h4>
		<ul>
			{#each actionLines as line, index (index)}
				<li>{line}</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.summary-section {
		display: grid;
		gap: 6px;
		min-width: 0;
	}

	.summary-section h4,
	.summary-section p {
		margin: 0;
	}

	.summary-section h4 {
		color: #4b4038;
		font-size: 18px;
	}

	.summary-section p {
		color: #736860;
		font-size: 12px;
		overflow-wrap: anywhere;
	}

	.detail-columns {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}

	.detail-list {
		min-width: 0;
		padding: 8px;
		border-radius: 8px;
		background: #faf8ff;
	}

	.detail-list h4,
	.detail-list ul {
		margin: 0;
	}

	.detail-list h4 {
		color: #5a4f47;
		font-size: 13px;
	}

	.detail-list ul {
		padding-left: 18px;
		color: #736860;
		font-size: 11px;
	}

	@media (max-width: 720px) {
		.detail-columns {
			width: 100%;
			grid-template-columns: 1fr;
		}
	}
</style>
