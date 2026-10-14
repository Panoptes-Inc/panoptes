<svelte:head>
  <title>Analysis Preview | Panoptes</title>
</svelte:head>

<script lang="ts">
  import AnalysisLoadingShell from '$lib/components/analysis/AnalysisLoadingShell.svelte';
  import AnalysisLoadingStageContent from '$lib/components/analysis/AnalysisLoadingStageContent.svelte';
  import type { AnalysisLoadingStageId } from '$lib/components/analysis/types';
  import {
    defaultMockAnalysisLoadingStageId,
    getMockAnalysisLoadingStage,
    mockAnalysisLoadingStages
  } from '$lib/mock/mockAnalysisLoadingState';

  let selectedStageId = $state<AnalysisLoadingStageId>(defaultMockAnalysisLoadingStageId);
  let previewVisible = $state(false);

  const activeStage = $derived(getMockAnalysisLoadingStage(selectedStageId));

  function openPreview(stageId: AnalysisLoadingStageId): void {
    selectedStageId = stageId;
    previewVisible = true;
  }
</script>

<div class="analysis-preview-page">
  {#if previewVisible}
    <aside class="analysis-preview-toolbar" aria-label="analysis preview stage switcher">
      <div class="analysis-preview-toolbar__actions">
        <button type="button" class="analysis-preview-toolbar__close" onclick={() => (previewVisible = false)}>
          Close
        </button>

        {#each mockAnalysisLoadingStages as stage (stage.id)}
          <button
            type="button"
            class:active={stage.id === selectedStageId}
            onclick={() => (selectedStageId = stage.id)}
          >
            <span>{stage.currentStep}/{stage.totalSteps}</span>
            <strong>{stage.title}</strong>
          </button>
        {/each}
      </div>
    </aside>

    <AnalysisLoadingShell surfaceLabel="Panoptes analysis loading UI preview">
      <AnalysisLoadingStageContent stage={activeStage} />
    </AnalysisLoadingShell>
  {:else}
    <section class="analysis-preview-launcher" aria-label="analysis preview launcher">
      <div class="analysis-preview-launcher__card">
        <p class="analysis-preview-launcher__eyebrow">DEV PREVIEW</p>
        <h1>分析中 UI を表示</h1>
        <p>下のボタンを押すと、reference 画像に合わせた分析中プレビューをそのまま確認できます。</p>

        <div class="analysis-preview-launcher__actions">
          {#each mockAnalysisLoadingStages as stage (stage.id)}
            <button type="button" onclick={() => openPreview(stage.id)}>
              <span>{stage.currentStep}/{stage.totalSteps}</span>
              <strong>{stage.title}</strong>
            </button>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .analysis-preview-page {
    position: relative;
    min-height: 100vh;
  }

  .analysis-preview-launcher {
    min-height: 100vh;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top left, rgba(255, 199, 162, 0.52), transparent 32%),
      linear-gradient(90deg, #ffb07a 0%, #ff9a60 42%, #ff8a43 100%);
  }

  .analysis-preview-launcher__card {
    width: min(100%, 620px);
    padding: 24px;
    border-radius: 20px;
    background: rgba(255, 252, 250, 0.94);
    box-shadow: 0 18px 40px rgba(171, 88, 30, 0.12);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .analysis-preview-launcher__eyebrow {
    margin: 0;
    color: #d96b1d;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .analysis-preview-launcher__card h1,
  .analysis-preview-launcher__card p {
    margin: 0;
  }

  .analysis-preview-launcher__card h1 {
    color: #4b311d;
    font-size: 28px;
    line-height: 1.15;
  }

  .analysis-preview-launcher__card p {
    color: #6e5a4c;
    font-size: 14px;
    line-height: 1.55;
  }

  .analysis-preview-launcher__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .analysis-preview-launcher__actions button {
    flex: 1 1 180px;
    border: 1px solid rgba(232, 158, 103, 0.42);
    border-radius: 16px;
    background: rgba(255, 247, 241, 0.92);
    color: #4b311d;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      background 160ms ease;
  }

  .analysis-preview-launcher__actions button span {
    color: #d96b1d;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .analysis-preview-launcher__actions button strong {
    font-size: 13px;
    line-height: 1.35;
    font-weight: 700;
    text-align: left;
  }

  .analysis-preview-launcher__actions button:hover {
    transform: translateY(-1px);
    border-color: rgba(232, 158, 103, 0.7);
    background: #fff;
  }

  .analysis-preview-toolbar {
    position: fixed;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    z-index: 20;
    width: min(860px, calc(100vw - 32px));
    padding: 10px;
    border-radius: 999px;
    background: rgba(72, 34, 12, 0.28);
    color: rgba(255, 250, 245, 0.96);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 32px rgba(71, 29, 5, 0.16);
  }

  .analysis-preview-toolbar__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .analysis-preview-toolbar__close {
    flex: 0 0 auto;
    border: 1px solid rgba(255, 234, 216, 0.24);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: inherit;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .analysis-preview-toolbar__actions button {
    flex: 1 1 132px;
    max-width: 160px;
    border: 1px solid rgba(255, 222, 200, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    color: inherit;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
    cursor: pointer;
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      background 160ms ease;
  }

  .analysis-preview-toolbar__actions button span {
    color: rgba(255, 234, 216, 0.92);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .analysis-preview-toolbar__actions button strong {
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
  }

  .analysis-preview-toolbar__actions button:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 207, 169, 0.34);
    background: rgba(255, 255, 255, 0.2);
  }

  .analysis-preview-toolbar__actions button.active {
    border-color: rgba(255, 209, 173, 0.7);
    background: rgba(255, 160, 95, 0.24);
  }

  @media (max-width: 900px) {
    .analysis-preview-launcher {
      padding: 16px;
    }

    .analysis-preview-launcher__card {
      padding: 20px;
    }

    .analysis-preview-toolbar {
      width: calc(100vw - 24px);
      bottom: 12px;
      padding: 8px;
      border-radius: 24px;
    }
  }
</style>
