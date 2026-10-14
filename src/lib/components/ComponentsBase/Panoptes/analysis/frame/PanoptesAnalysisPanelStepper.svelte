<script lang="ts">
  import type { PanoptesVisibleStep } from '$lib/panoptes/types';

  const STEP_LABELS: Array<{ id: PanoptesVisibleStep; label: string }> = [
    { id: 'target_scan', label: '対象URL' },
    { id: 'inference_review', label: '推定確認' },
    { id: 'competitor_analysis', label: '競合' },
    { id: 'industry_analysis', label: '業界' },
    { id: 'strategy_synthesis', label: '戦略' }
  ];

  let { activeStep = 'target_scan' }: { activeStep?: PanoptesVisibleStep } = $props();
</script>

<div class="stepper" aria-label="分析ステップ">
  {#each STEP_LABELS as step}
    <div class="step" class:active={step.id === activeStep}>
      <span></span>
      <small>{step.label}</small>
    </div>
  {/each}
</div>

<style>
  .stepper {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  .step {
    display: grid;
    gap: 8px;
    justify-items: center;
    color: #c9a68b;
  }

  .step span {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: #f3d5bf;
    position: relative;
  }

  .step span::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #f59f67;
    border: 3px solid #fff7f0;
  }

  .step.active {
    color: #ff6200;
  }

  .step.active span {
    background: linear-gradient(90deg, #ffc59b, #ff8d44);
  }

  .step small {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
</style>
