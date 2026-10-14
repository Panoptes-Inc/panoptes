<script>
  import IndustryDistributionRingCard from './IndustryDistributionRingCard.svelte';

  let {
    primary = {},
    secondary = []
  } = $props();

  function ringGradient(value = 0, color = '#ff6a00') {
    return `background: conic-gradient(${color} 0 ${value}%, #ece7df ${value}% 100%);`;
  }
</script>

<div class="ring-cluster">
  <article class="primary-card">
    <div class="primary-ring" style={ringGradient(primary?.value, primary?.color)}>
      <div class="primary-inner">
        <p class="primary-title">{primary?.title ?? '--'}</p>
        <p class="primary-sub">{primary?.subLabel ?? '--'}</p>
        <strong>{primary?.value ?? 0}<span>%</span></strong>
        <p class="primary-caption">{primary?.descriptor ?? '--'}</p>
        <p class="primary-foot">{primary?.descriptorText ?? ''}</p>
      </div>
    </div>
  </article>

  <div class="secondary-stack">
    {#each secondary as ring, index (`ring-${index}`)}
      <IndustryDistributionRingCard {ring} />
    {/each}
  </div>
</div>

<style>
  .ring-cluster {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 14px;
    align-items: center;
  }

  .primary-card {
    display: grid;
    place-items: center;
  }

  .primary-ring {
    width: min(100%, 320px);
    aspect-ratio: 1;
    border-radius: 50%;
    padding: 10px;
    box-sizing: border-box;
    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.4);
  }

  .primary-inner {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.96);
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;
    gap: 4px;
    padding: 18px;
    box-sizing: border-box;
  }

  .primary-title,
  .primary-sub,
  .primary-caption,
  .primary-foot {
    margin: 0;
  }

  .primary-title {
    color: var(--industry-orange, #ff6a00);
    font-size: clamp(18px, 1.7vw, 22px);
    font-weight: 800;
  }

  .primary-sub {
    color: var(--industry-text, #3f3832);
    font-size: 15px;
    font-weight: 700;
  }

  strong {
    color: var(--industry-orange, #ff6a00);
    font-size: clamp(34px, 3vw, 46px);
    line-height: 1;
  }

  strong span {
    font-size: 20px;
  }

  .primary-caption {
    margin-top: 2px;
    color: var(--industry-text, #3f3832);
    font-size: 14px;
    font-weight: 700;
  }

  .primary-foot {
    color: var(--industry-muted, #7b7269);
    font-size: 14px;
  }

  .secondary-stack {
    display: grid;
    gap: 12px;
  }

  @media (max-width: 720px) {
    .ring-cluster {
      grid-template-columns: 1fr;
    }

    .secondary-stack {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
