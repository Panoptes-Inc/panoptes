<script lang="ts">
  let {
    centerScore = 0,
    outerScore = 0,
    innerScore = 0
  }: {
    centerScore: number;
    outerScore: number;
    innerScore: number;
  } = $props();

  const clampedOuter = $derived(Math.max(0, Math.min(outerScore, 100)));
  const clampedInner = $derived(Math.max(0, Math.min(innerScore, 100)));
  const outerStyle = $derived(`conic-gradient(#ff9f63 0deg ${clampedOuter * 3.6}deg, #f8e0d0 ${clampedOuter * 3.6}deg 360deg)`);
  const innerStyle = $derived(`conic-gradient(#8d86ff 0deg ${clampedInner * 3.6}deg, #e1ddff ${clampedInner * 3.6}deg 360deg)`);
</script>

<div
  class="self-analysis-dual-ring-gauge"
  aria-label={`総合 ${centerScore} / 内部構造 ${clampedOuter} / ビジュアル ${clampedInner}`}
>
  <div class="outer-ring" style:background={outerStyle}></div>
  <div class="inner-ring" style:background={innerStyle}></div>
  <div class="gauge-center">
    <small>総合</small>
    <strong>{centerScore}</strong>
  </div>
</div>

<style>
  .self-analysis-dual-ring-gauge {
    position: relative;
    width: 200px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
  }

  .outer-ring,
  .inner-ring,
  .gauge-center {
    position: absolute;
    border-radius: 999px;
  }

  .outer-ring {
    inset: 0;
  }

  .outer-ring::after {
    content: '';
    position: absolute;
    inset: 12px;
    border-radius: inherit;
    background: #fffdfb;
  }

  .inner-ring {
    inset: 20px;
  }

  .inner-ring::after {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: inherit;
    background: #fffdfb;
  }

  .gauge-center {
    inset: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;
    gap: 4px;
    background: #fffdfb;
    text-align: center;
    z-index: 1;
  }

  small {
    color: #8a7a6d;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    position: absolute;
    top:15%;
  }

  strong {
    color: #5a4a3f;
    font-size: 46px;
    line-height: 1;
  }
</style>
