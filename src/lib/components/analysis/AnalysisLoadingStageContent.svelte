<script lang="ts">
  import type { AnalysisLoadingStageState } from './types';

  let {
    stage
  }: {
    stage: AnalysisLoadingStageState;
  } = $props();

  const activeStepIndex = $derived(Math.max(0, Math.min(stage.currentStep - 1, stage.totalSteps - 1)));
  const steps = $derived(Array.from({ length: stage.totalSteps }, (_, index) => index));
  const isInferenceReview = $derived(stage.variant === 'inference-review');
</script>

<div class="analysis-loading-stage">
  <div class="analysis-loading-stage__stepper" aria-label="analysis stepper">
    {#each steps as stepIndex (`step-${stepIndex}`)}
      <div class="analysis-loading-stage__step-item">
        <span class:active={stepIndex === activeStepIndex} class="analysis-loading-stage__step-dot"></span>
        {#if stepIndex < steps.length - 1}
          <span class="analysis-loading-stage__step-line"></span>
        {/if}
      </div>
    {/each}
  </div>

  {#if isInferenceReview}
    <section class="analysis-loading-stage__body analysis-loading-stage__body--inference">
      <div class="analysis-loading-stage__headline">{stage.title}</div>

      <article class="analysis-loading-stage__inference-card">
        {#each stage.inferenceRows ?? [] as row, index (row.id)}
          <div class="analysis-loading-stage__inference-row">
            <div class="analysis-loading-stage__inference-main">
              <span class="analysis-loading-stage__inference-label">{row.label}</span>
              <strong>{row.value}</strong>
            </div>

            {#if row.confidenceLabel}
              <span class={`analysis-loading-stage__confidence ${row.confidenceTone ?? 'medium'}`}>
                {row.confidenceLabel}
              </span>
            {/if}
          </div>

          {#if index < (stage.inferenceRows?.length ?? 0) - 1}
            <div class="analysis-loading-stage__inference-divider" aria-hidden="true"></div>
          {/if}
        {/each}
      </article>

      <p class="analysis-loading-stage__note">{stage.message}</p>

      <div class="analysis-loading-stage__actions">
        {#each stage.actions ?? [] as action (action.id)}
          <button type="button" class={`analysis-loading-stage__action ${action.tone}`}>
            {action.label}
          </button>
        {/each}
      </div>
    </section>
  {:else}
    <section class="analysis-loading-stage__body analysis-loading-stage__body--message">
      <p class="analysis-loading-stage__message">{stage.title}</p>
    </section>
  {/if}
</div>

<style>
  .analysis-loading-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-height: 0;
    color: #665c54;
  }

  .analysis-loading-stage__stepper,
  .analysis-loading-stage__step-item,
  .analysis-loading-stage__inference-row,
  .analysis-loading-stage__inference-main,
  .analysis-loading-stage__actions {
    display: flex;
    align-items: center;
  }

  .analysis-loading-stage__stepper {
    justify-content: center;
    gap: 0;
    padding-top: 6px;
  }

  .analysis-loading-stage__step-item {
    flex: 0 0 auto;
  }

  .analysis-loading-stage__step-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(255, 161, 94, 0.88);
    box-shadow: 0 0 0 1px rgba(255, 161, 94, 0.18);
  }

  .analysis-loading-stage__step-dot.active {
    width: 13px;
    height: 13px;
    background: #ef6b17;
    box-shadow:
      inset 0 0 0 3px rgba(255, 233, 219, 0.92),
      0 0 0 1px rgba(239, 107, 23, 0.28);
  }

  .analysis-loading-stage__step-line {
    width: 74px;
    height: 1px;
    background: rgba(244, 159, 95, 0.82);
  }

  .analysis-loading-stage__body {
    flex: 1;
    min-height: 0;
  }

  .analysis-loading-stage__body--message {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0 18px;
  }

  .analysis-loading-stage__message {
    margin: 0;
    color: #7a726b;
    font-size: clamp(22px, 3vw, 28px);
    line-height: 1.35;
    letter-spacing: 0.01em;
    text-align: center;
  }

  .analysis-loading-stage__body--inference {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 4px 0 10px;
  }

  .analysis-loading-stage__headline {
    padding: 10px 26px;
    border-radius: 6px;
    background: linear-gradient(180deg, #ff8b27 0%, #ff6b06 100%);
    color: #fff;
    font-size: clamp(20px, 2vw, 24px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .analysis-loading-stage__inference-card {
    width: min(100%, 344px);
    border-radius: 8px;
    border: 1px solid rgba(223, 223, 223, 0.9);
    background: #fff;
    box-shadow: 0 10px 24px rgba(120, 86, 55, 0.08);
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .analysis-loading-stage__inference-row {
    justify-content: space-between;
    gap: 12px;
  }

  .analysis-loading-stage__inference-main {
    gap: 6px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .analysis-loading-stage__inference-label,
  .analysis-loading-stage__inference-main strong,
  .analysis-loading-stage__confidence,
  .analysis-loading-stage__note,
  .analysis-loading-stage__action {
    font-size: 13px;
  }

  .analysis-loading-stage__inference-label,
  .analysis-loading-stage__inference-main strong {
    color: #6b635d;
    line-height: 1.5;
  }

  .analysis-loading-stage__inference-main strong {
    font-weight: 700;
  }

  .analysis-loading-stage__confidence {
    line-height: 1.4;
    white-space: nowrap;
  }

  .analysis-loading-stage__confidence.high {
    color: #ff7f1f;
  }

  .analysis-loading-stage__confidence.medium {
    color: #8c8681;
  }

  .analysis-loading-stage__confidence.low {
    color: #9084ff;
  }

  .analysis-loading-stage__inference-divider {
    width: 100%;
    height: 1px;
    background: rgba(241, 203, 171, 0.86);
  }

  .analysis-loading-stage__note {
    margin: 0;
    color: #ff7b20;
    line-height: 1.5;
    text-align: center;
  }

  .analysis-loading-stage__actions {
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .analysis-loading-stage__action {
    min-width: 166px;
    border-radius: 999px;
    padding: 10px 16px;
    border: 1px solid transparent;
    font-weight: 700;
    line-height: 1.2;
    cursor: default;
  }

  .analysis-loading-stage__action.secondary {
    border-color: #8e86ff;
    background: linear-gradient(90deg, rgba(172, 163, 255, 0.96) 0%, rgba(144, 132, 255, 0.92) 100%);
    color: #fff;
  }

  .analysis-loading-stage__action.primary {
    border-color: #ffb27a;
    background: linear-gradient(90deg, rgba(255, 179, 119, 0.96) 0%, rgba(255, 141, 69, 0.96) 100%);
    color: #fff;
  }

  @media (max-width: 720px) {
    .analysis-loading-stage__step-line {
      width: 46px;
    }

    .analysis-loading-stage__message {
      font-size: 20px;
    }

    .analysis-loading-stage__headline {
      width: 100%;
      padding-inline: 16px;
      font-size: 18px;
    }

    .analysis-loading-stage__inference-card {
      width: 100%;
      padding: 16px;
    }

    .analysis-loading-stage__inference-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .analysis-loading-stage__action {
      width: 100%;
    }
  }
</style>
