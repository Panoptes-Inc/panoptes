<script>
  import IndustryRatingMetricBars from './IndustryRatingMetricBars.svelte';
  import IndustryRatingSummaryColumn from './IndustryRatingSummaryColumn.svelte';
  import IndustryRatingSummaryHighlightCard from './IndustryRatingSummaryHighlightCard.svelte';

  let { rating } = $props();
</script>

<section class="rating-panel" aria-label="業界評価">
  <header class="panel-head">
    <div class="head-grid">
      <h2>業界評価</h2>
      <p>業界評価サマリー</p>
    </div>
  </header>

  <div class="panel-grid">
    <div class="summary-stack">
      <IndustryRatingMetricBars metrics={rating?.metrics ?? []} />
      <IndustryRatingSummaryColumn insight={rating?.insight} />
    </div>
      <div class="highlight-grid">
        {#each rating?.highlights ?? [] as highlight, index (`highlight-${index}`)}
          <IndustryRatingSummaryHighlightCard {highlight} />
        {/each}
      </div>    
  </div>
</section>

<style>
  .summary-stack,
  .highlight-grid {
    display: flex;
    gap: 8px;
  }

  .highlight-grid {
    display: flex;
    gap: 8px;
    flex: 1;
  }

  .head-grid {
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 8px;
  }  

  .rating-panel {
    width: 100%;
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    flex-flow: column;
    gap: 8px;
    flex: 1 0 auto;
    min-height: 0;
  }

  .panel-head h2 {
    margin: 0;
    color: var(--industry-text, #3f3832);
    font-size: 16px;
  }

  .panel-head p {
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
    font-weight: 400;
  }

  .panel-grid {
    display: flex;
    flex-flow: column;
    gap: 8px;
    flex: 1;
  }

  @media (max-width: 960px) {
    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
