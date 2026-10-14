<script lang="ts">
  import type { PanoptesInferenceDraft } from '$lib/panoptes/types';

  let {
    inferenceDraft = null,
    submitDisabled = false,
    onIndustryInput = () => {},
    onStructureInput = () => {},
    onScaleInput = () => {},
    onConfirm = () => {}
  }: {
    inferenceDraft?: PanoptesInferenceDraft | null;
    submitDisabled?: boolean;
    onIndustryInput?: (value: string) => void;
    onStructureInput?: (value: string) => void;
    onScaleInput?: (value: string) => void;
    onConfirm?: () => void;
  } = $props();
</script>

<div class="review-step">
  <div class="review-card">
    <label>
      <span>推定業界</span>
      <input value={inferenceDraft?.inferredIndustry ?? ''} oninput={(event) => onIndustryInput((event.currentTarget as HTMLInputElement).value)} />
      <small>信頼度: {inferenceDraft?.industryConfidence ?? 'medium'}</small>
    </label>
    <label>
      <span>推定構造タイプ</span>
      <input value={inferenceDraft?.inferredStructureType ?? ''} oninput={(event) => onStructureInput((event.currentTarget as HTMLInputElement).value)} />
      <small>信頼度: {inferenceDraft?.structureConfidence ?? 'medium'}</small>
    </label>
    <label>
      <span>推定サイト規模</span>
      <input value={inferenceDraft?.inferredSiteScale ?? ''} oninput={(event) => onScaleInput((event.currentTarget as HTMLInputElement).value)} />
      <small>信頼度: {inferenceDraft?.scaleConfidence ?? 'medium'}</small>
    </label>
  </div>

  {#if inferenceDraft?.notes?.length}
    <ul class="notes">
      {#each inferenceDraft.notes as note}
        <li>{note}</li>
      {/each}
    </ul>
  {/if}

  <div class="actions">
    <button type="button" class="secondary" disabled>修正する</button>
    <button type="button" class="primary" onclick={onConfirm} disabled={submitDisabled}>競合分析を開始</button>
  </div>
</div>

<style>
  .review-step {
    display: grid;
    gap: 18px;
    justify-items: center;
  }

  .review-card {
    width: min(560px, 100%);
    display: grid;
    gap: 14px;
    padding: 20px;
    border-radius: 24px;
    border: 1px solid #efe1d6;
    background: #fff;
  }

  label {
    display: grid;
    gap: 8px;
    color: #53493f;
  }

  label span {
    font-size: 13px;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border-radius: 16px;
    border: 1px solid #eadfd3;
    background: #fffaf5;
    padding: 12px 14px;
    color: #473c34;
    font-size: 14px;
  }

  small {
    color: #8a7f75;
    font-size: 12px;
  }

  .notes {
    margin: 0;
    padding-left: 18px;
    color: #7a6f66;
    font-size: 13px;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .actions button {
    border: 0;
    border-radius: 999px;
    min-width: 160px;
    min-height: 46px;
    cursor: pointer;
  }

  .secondary {
    background: linear-gradient(135deg, #beb8ff, #8d82ff);
    color: #fff;
    opacity: 0.56;
  }

  .primary {
    background: linear-gradient(135deg, #ffb07b, #ff7b1f);
    color: #fff;
  }
</style>
