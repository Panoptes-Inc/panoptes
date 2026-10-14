<script>
  let { lane } = $props();
</script>

<article class="lane-card">
  <h3>{lane?.title ?? '--'}</h3>

  <div class="lane-block">
    <p class="lane-title">理由</p>
    <p class="lane-copy">{lane?.reason ?? ''}</p>
  </div>

  <div class="lane-block">
    <p class="lane-title">競合群の不足点</p>
    <ul>
      {#each lane?.gaps ?? [] as gap, index (`gap-${index}`)}
        <li>{gap}</li>
      {/each}
    </ul>
  </div>

  <div class="lane-block">
    <p class="lane-title">自社との相性</p>
    <ul>
      {#each lane?.actions ?? [] as action, index (`action-${index}`)}
        <li>{action}</li>
      {/each}
    </ul>
  </div>
</article>

<style>
  .lane-card {
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    flex-flow: column;
    gap: 8px;
    flex: 1;
  }

  h3 {
    margin: 0;
    color: var(--industry-text, #3f3832);
    font-size: 16px;
    font-weight: 600;
  }

  .lane-block {
    display: grid;
    gap: 6px;
  }

  .lane-title,
  .lane-copy {
    margin: 0;
  }

  .lane-title {
    color: var(--industry-text, #3f3832);
    font-size: 13px;
    font-weight: 600;
  }

  .lane-copy,
  ul {
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }

  ul {
    margin: 0;
    display: flex;
    flex-flow: column;
  }
</style>
