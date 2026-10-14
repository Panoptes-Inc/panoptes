<script lang="ts">
  let {
    percent = 0,
  }: {
    percent: number;
  } = $props();

  const clampedPercent = $derived(Math.max(0, Math.min(percent, 100)));
  const clampedPercentbar = $derived( 100 - Math.max(0, Math.min(percent, 100)));
</script>

<div class="strategy-improvement-meter" aria-label={`改善余地 ${clampedPercent}%`}>
  <div class="meter-track">
    <div class="meter-fill" style:width={`${clampedPercentbar}%`}>
      <strong>+{clampedPercent}% の改善余地あり</strong>
    </div>
  </div>
</div>

<style>
  .strategy-improvement-meter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .meter-track {
    flex: 1 1 320px;
    border-radius: 999px;
    background: #ffd8bf;
    overflow: hidden;
    min-height: 38px;
  }

  .meter-fill {
    height: 100%;
    min-height: inherit;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #ffcbab, #ff6714);
    color: #fff;
    white-space: nowrap;
    padding: 0 18px;
  }

  .meter-fill strong {
    font-size: 16px;
  }

  @media (max-width: 960px) {
    .meter-track {
      flex: 1 1 100%;
    }
  }
</style>
