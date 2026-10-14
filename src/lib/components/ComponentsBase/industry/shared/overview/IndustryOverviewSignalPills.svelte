<script>
  let { signals = [] } = $props();
</script>

<ul class="signal-pills" aria-label="市場シグナル">
  {#each signals as signal, index (`signal-${index}`)}
    <li>{signal}</li>
  {/each}
</ul>

<style>
  .signal-pills {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .signal-pills li {
    border-radius: 999px;
    border: 1px solid rgba(116, 109, 255, 0.36);
    background: rgba(255, 255, 255, 0.7);
    color: var(--industry-violet, #7771ff);
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 700;
  }

  @media (max-width: 1360px) {
    .signal-pills {
      justify-content: flex-start;
    }
  }
</style>
