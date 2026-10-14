<script>
  let { card } = $props();
</script>

<article class="summary-card">
  <h3>{card?.title ?? '--'}</h3>

  <ul>
    {#each card?.lines ?? [] as line, index (`line-${index}`)}
      <li>{line}</li>
    {/each}
  </ul>
</article>

<style>
  .summary-card {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
  }

  h3 {
    margin: 0 0 8px;
    color: var(--industry-text, #3f3832);
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 6px;
  }

  li {
    color: var(--industry-muted, #7b7269);
    font-size: 13px;
    line-height: 1.5;
  }
</style>
