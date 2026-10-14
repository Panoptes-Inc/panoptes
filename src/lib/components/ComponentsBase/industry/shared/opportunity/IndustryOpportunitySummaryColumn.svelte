<script>
  let { opportunity } = $props();
</script>

<div class="summary-column">
  <section class="summary-card" aria-label="機会分析サマリー">
    <h3>機会分析サマリー</h3>
    <div class="summary-wrap">
      <div class="summary-block">
        <p class="summary-title">業界の主戦場</p>
        <ul>
          {#each opportunity?.summary?.battlefields ?? [] as battlefield, index (`battlefield-${index}`)}
            <li>・{battlefield}</li>
          {/each}
        </ul>
      </div>

      <div class="summary-block">
        <p class="summary-title">施策優先順位</p>
        <ul>
          {#each opportunity?.summary?.priorities ?? [] as priority, index (`priority-${index}`)}
            <li>・{priority}</li>
          {/each}
        </ul>
      </div>      
    </div>

  </section>

  <section class="insight-card" aria-label={opportunity?.insight?.label ?? 'AI評価'}>
    <p class="insight-label">{opportunity?.insight?.label ?? 'AI評価'}</p>

    {#each opportunity?.insight?.paragraphs ?? [] as paragraph, index (`paragraph-${index}`)}
      <p class="insight-copy">{paragraph}</p>
    {/each}
  </section>
</div>

<style>
  .summary-column {
    display: flex;
    flex-flow: column;
    gap: 8px;
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
  }

  .summary-wrap {
    display: flex;
  }

  .summary-block {
    border-radius: 8px;
    background: #fff;
    padding: 8px;
    box-shadow: var(--industry-panel-shadow);
    width: 100%;
  }

  .insight-card {
    border-radius: 8px;
    background: #fff;
    padding: 8px;
    box-shadow: var(--industry-panel-shadow);
    flex: 1 1 auto;
  }

  h3 {
    margin: 0 0 12px;
    color: var(--industry-text, #3f3832);
    font-size: 16px;
    text-align: center;
  }

  .summary-title {
    margin: 0 0 8px;
    color: var(--industry-text, #3f3832);
    font-size: 14px;
    font-weight: 700;
  }

  .summary-card ul {
    margin: 0;
    display: grid;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }

  .insight-card {
    display: flex;
    flex-flow: column;
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
