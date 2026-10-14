<script>
  let { ring = {} } = $props();

  function ringGradient(value = 0, color = '#ffb886') {
    return `background: conic-gradient(${color} 0 ${value}%, #ece7df ${value}% 100%);`;
  }
</script>

<article class="ring-card">
  <div class="ring-shell" style={ringGradient(ring?.value, ring?.color)}>
    <div class="ring-inner">
      <p>{ring?.title ?? '--'}</p>
      <strong>{ring?.value ?? 0}<span>%</span></strong>
    </div>
  </div>
</article>

<style>
  .ring-card {
    display: grid;
    place-items: center;
  }

  .ring-shell {
    width: 140px;
    aspect-ratio: 1;
    border-radius: 50%;
    padding: 6px;
    box-sizing: border-box;
  }

  .ring-inner {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(255, 255, 255);
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
    gap: 4px;
  }

  p,
  strong {
    margin: 0;
  }

  p {
    color: var(--industry-text, #3f3832);
    font-size: 14px;
    font-weight: 700;
  }

  strong {
    color: var(--industry-orange, #ff6a00);
    font-size: 26px;
    line-height: 1;
  }

  strong span {
    font-size: 16px;
  }
</style>
