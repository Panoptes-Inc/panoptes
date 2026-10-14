<script>
  let { metric } = $props();

  const toneClass = $derived.by(() => metric?.tone ?? 'orange');
</script>

<article class="metric-card">
  <div class="metric-top">
    <h3>{metric?.label ?? '--'}</h3>
    <strong>{metric?.value ?? 0}</strong>
  </div>

  <div class="bar-track" aria-hidden="true">
    <span class={`bar-fill ${toneClass}`} style={`width: ${metric?.value ?? 0}%;`}></span>
  </div>
</article>

<style>
  .metric-card {
    display: flex;
    flex-flow: column;
    gap: 8px;
  }

  .metric-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  h3 {
    margin: 0;
    color: var(--industry-text, #3f3832);
    font-size: 15px;
    font-weight: 700;
  }

  strong {
    color: var(--industry-text, #3f3832);
    font-size: 16px;
  }

  .bar-track {
    height: 12px;
    border-radius: 999px;
    overflow: hidden;
    background: #ead9cf;
  }

  .bar-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
  }

  .bar-fill.orange {
    background: linear-gradient(90deg, #ff8d46 0%, #ff6a00 100%);
  }

  .bar-fill.orange-soft {
    background: linear-gradient(90deg, #f6a56e 0%, #f49454 100%);
  }

  .bar-fill.violet {
    background: linear-gradient(90deg, #aaa3ff 0%, #7f78ff 100%);
  }
</style>
