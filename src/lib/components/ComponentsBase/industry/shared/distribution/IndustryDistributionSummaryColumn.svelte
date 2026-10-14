<script>
  let {
    stats = [],
    leaders = [],
    insight = { label: 'AI評価', paragraphs: [] }
  } = $props();
</script>

<div class="summary-column">
  <section class="stats-card" aria-label="業界型分布サマリー">
    <h3>業界型分布サマリー</h3>

    <ul class="stats-list">
      {#each stats as stat, index (`stat-${index}`)}
        <li>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </li>
      {/each}
    </ul>

    <div class="leaders">
      {#each leaders as leader, index (`leader-${index}`)}
        <p>{leader}</p>
      {/each}
    </div>
  </section>

  <section class="insight-card" aria-label={insight?.label ?? 'AI評価'}>
    <p class="insight-label">{insight?.label ?? 'AI評価'}</p>

    {#each insight?.paragraphs ?? [] as paragraph, index (`paragraph-${index}`)}
      <p class="insight-copy">{paragraph}</p>
    {/each}
  </section>
</div>

<style>
  .summary-column {
    display: flex;
    gap: 8px;
    flex-flow: column;
  }

  .stats-card,
  .insight-card {
    border-radius: 8px;
    box-shadow: var(--industry-panel-shadow);
    background: #fff;
    padding: 8px;
  }

  h3 {
    margin: 0 0 8px;
    color: var(--industry-text, #3f3832);
    font-size: 16px;
  }

  .stats-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    gap: 4px;
    flex-flow: column;
  }

  .stats-list li {
    display: flex;
    justify-content: space-between;
    gap: 4px;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }

  .stats-list strong {
    color: var(--industry-text, #3f3832);
  }

  .leaders {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(225, 216, 206, 0.96);
    display: flex;
    flex-flow: column;
    gap: 8px;
  }

  .leaders p {
    margin: 0;
    color: var(--industry-orange, #ff6a00);
    font-size: 12px;
    font-weight: 700;
  }

  .insight-card {
    display: flex;
    gap: 8px;
    flex-flow: column;
    flex: 1 1 auto;
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
