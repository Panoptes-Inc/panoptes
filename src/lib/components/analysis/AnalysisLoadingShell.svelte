<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    surfaceLabel = 'Panoptes analysis loading preview'
  }: {
    children?: Snippet;
    surfaceLabel?: string;
  } = $props();
</script>

<section class="analysis-loading-shell" aria-label={surfaceLabel}>
  <div class="analysis-loading-shell__ambient analysis-loading-shell__ambient--left" aria-hidden="true"></div>
  <div class="analysis-loading-shell__ambient analysis-loading-shell__ambient--right" aria-hidden="true"></div>

  <div class="analysis-loading-shell__inner">
    <div class="analysis-loading-shell__frame">
      {@render children?.()}
    </div>
  </div>
</section>

<style>
  .analysis-loading-shell {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    padding: clamp(24px, 4vw, 40px);
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top left, rgba(255, 199, 162, 0.52), transparent 32%),
      linear-gradient(90deg, #ffb07a 0%, #ff9a60 42%, #ff8a43 100%);
    isolation: isolate;
  }

  .analysis-loading-shell__ambient {
    position: absolute;
    border-radius: 999px;
    filter: blur(22px);
    opacity: 0.54;
    pointer-events: none;
  }

  .analysis-loading-shell__ambient--left {
    top: 10%;
    left: -6%;
    width: min(34vw, 360px);
    height: min(34vw, 360px);
    background: rgba(255, 219, 192, 0.32);
  }

  .analysis-loading-shell__ambient--right {
    right: -6%;
    bottom: 6%;
    width: min(32vw, 320px);
    height: min(32vw, 320px);
    background: rgba(255, 132, 49, 0.18);
  }

  .analysis-loading-shell__inner {
    position: relative;
    z-index: 1;
    width: min(100%, 560px);
    display: flex;
    justify-content: center;
  }

  .analysis-loading-shell__frame {
    width: min(100%, 530px);
    min-height: min(520px, calc(100vh - 96px));
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.76);
    background: rgba(255, 252, 250, 0.94);
    box-shadow: 0 18px 40px rgba(171, 88, 30, 0.1);
    padding: 34px 28px 28px;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 900px) {
    .analysis-loading-shell {
      padding: 16px;
    }

    .analysis-loading-shell__frame {
      min-height: auto;
      border-radius: 8px;
      padding: 24px 18px 20px;
    }
  }
</style>
