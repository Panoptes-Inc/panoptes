<script>
  let {
    insight = { label: 'AI評価', paragraphs: [] }
  } = $props();
</script>

<div class="summary-column">

  <section class="insight-card" aria-label={insight?.label ?? 'AI評価'}>
    <p class="insight-label">{insight?.label ?? 'AI評価'}</p>

    {#each insight?.paragraphs ?? [] as paragraph, index (`paragraph-${index}`)}
      <p class="insight-copy">{paragraph}</p>
    {/each}
  </section>
</div>

<style>
  .summary-column {
    display: grid;
    gap: 12px;
    flex: 0.4;
  }

  .insight-card {
    border-radius: 8px;
    background: #ffffff;
    padding: 8px;
    display: flex;
    flex-flow: column;
    box-shadow: var(--industry-panel-shadow);
    gap: 8px;
  }

  .insight-label {
    margin: 0;
    color: var(--industry-orange, #ff6a00);
    font-size: 14px;
    font-weight: 800;
  }

  .insight-copy {
    margin: 0;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }
</style>
