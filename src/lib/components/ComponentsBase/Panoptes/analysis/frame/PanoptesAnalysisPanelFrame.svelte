<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PanoptesVisibleStep } from '$lib/panoptes/types';
  import PanoptesAnalysisPanelStepper from './PanoptesAnalysisPanelStepper.svelte';

  let {
    mode = 'full',
    title = '',
    subtitle = '',
    activeStep = 'target_scan',
    children,
    footer
  }: {
    mode?: 'full' | 'overlay';
    title?: string;
    subtitle?: string;
    activeStep?: PanoptesVisibleStep;
    children?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<section class={`analysis-panel ${mode}`} aria-label="分析進行パネル">
  <PanoptesAnalysisPanelStepper {activeStep} />

  <header class="panel-header">
    <h2>{title}</h2>
    <p>{subtitle}</p>
  </header>

  <div class="panel-body">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if footer}
    <footer class="panel-footer">
      {@render footer()}
    </footer>
  {/if}
</section>

<style>
  .analysis-panel {
    background: linear-gradient(180deg, rgba(255, 254, 252, 0.96), rgba(255, 247, 240, 0.96));
    border-radius: 34px;
    border: 1px solid rgba(237, 220, 205, 0.9);
    box-shadow: 0 24px 60px rgba(44, 28, 12, 0.1);
    padding: 32px;
    min-height: 520px;
    display: grid;
    gap: 28px;
  }

  .analysis-panel.overlay {
    min-height: 0;
    padding: 24px;
    border-radius: 28px;
    background: rgba(255, 251, 247, 0.95);
  }

  .panel-header {
    display: grid;
    gap: 10px;
    justify-items: center;
    text-align: center;
  }

  .panel-header h2 {
    margin: 0;
    color: #4a3f36;
    font-size: clamp(24px, 2vw, 34px);
    line-height: 1.2;
  }

  .panel-header p {
    margin: 0;
    max-width: 560px;
    color: #7b7067;
    font-size: 14px;
    line-height: 1.6;
  }

  .panel-body {
    display: grid;
    align-content: center;
  }

  .panel-footer {
    display: flex;
    justify-content: center;
  }
</style>
