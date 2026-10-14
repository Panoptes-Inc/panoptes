<script lang="ts">
  let { value = 0 }: { value: number } = $props();

  const clampedValue = $derived(Math.max(0, Math.min(value, 100)));
  const ringStyle = $derived(`conic-gradient(#ff8d42 0deg ${clampedValue * 3.6}deg, #ffe2d0 ${clampedValue * 3.6}deg 360deg)`);
</script>

<div class="strategy-fit-gauge" style:background={ringStyle} aria-label={`戦略適合指数 ${clampedValue}`}>
  <div class="gauge-center">
    <strong>{clampedValue}</strong>
  </div>
</div>

<style>
  .strategy-fit-gauge {
    width: 200px;
    aspect-ratio: 1;
    border-radius: 999px;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .gauge-center {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: #fffdfb;
    display: grid;
    place-items: center;
  }

  strong {
    color: #5a4638;
    font-size: 40px;
    line-height: 1;
  }
</style>
