<script>
  import IndustryPositionSummaryCard from './IndustryPositionSummaryCard.svelte';

  let {
    cards = [],
    pressureLabel = '',
    insight = { label: 'AI評価', paragraphs: [] }
  } = $props();
</script>

<div class="summary-stack">
  <div class="summary-grid">
    {#each cards as card, index (`card-${index}`)}
      <IndustryPositionSummaryCard {card} />
    {/each}
  </div>

  {#if pressureLabel}
    <p class="pressure-pill">{pressureLabel}</p>
  {/if}

  <section class="insight-card" aria-label={insight?.label ?? 'AI評価'}>
    <p class="insight-label">{insight?.label ?? 'AI評価'}</p>

    {#each insight?.paragraphs ?? [] as paragraph, index (`paragraph-${index}`)}
      <p class="insight-copy">{paragraph}</p>
    {/each}
  </section>
</div>

<style>
  .summary-stack {
    display: flex;
    gap: 8px;
    flex-flow: column;
    flex: 1 1 auto;
    min-height: 0;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .pressure-pill {
    margin: 0;
    border-radius: 8px;
    box-shadow: var(--industry-panel-shadow);
    background: #ffffff;
    color: var(--industry-violet, #7771ff);
    font-size: 13px;
    font-weight: 700;
    padding: 10px 12px;
  }

  .insight-card {
    border-radius: 8px;
    background: #ffffff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;
  }

  .insight-label {
    margin: 0 0 8px;
    color: var(--industry-orange, #ff6a00);
    font-size: 14px;
    font-weight: 800;
  }

  .insight-copy {
    margin: 0;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }

  @media (max-width: 560px) {
    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
