<script lang="ts">
  import type { PanoptesProjectSummary } from '$lib/panoptes/types';

  const DISPLAY_STATE_LABELS: Record<PanoptesProjectSummary['displayState'], string> = {
    empty: '未分析',
    analyzing: '分析中',
    failed: '失敗',
    ready: '準備完了'
  };

  const STEP_LABELS: Record<string, string> = {
    target_scan: '対象URL',
    inference_review: '推定確認',
    competitor_analysis: '競合',
    industry_analysis: '業界',
    strategy_synthesis: '戦略'
  };

  let {
    project,
    selected = false,
    onSelect = () => {}
  }: {
    project: PanoptesProjectSummary;
    selected?: boolean;
    onSelect?: (projectId: string) => void;
  } = $props();

  const progressWidth = $derived(
    project.latestProgressPercent === null ? '0%' : `${Math.max(8, Math.min(100, project.latestProgressPercent))}%`
  );
</script>

<button type="button" class:selected class="project-card" onclick={() => onSelect(project.projectId)}>
  <div class="project-title-row">
    <strong>{project.projectName}</strong>
    <span>{DISPLAY_STATE_LABELS[project.displayState]}</span>
  </div>
  <p>{project.targetUrl}</p>
  <div class="project-progress">
    <span>{project.latestProgressPhase ? STEP_LABELS[project.latestProgressPhase] : 'snapshot ready'}</span>
    <div class="progress-track">
      <div class="progress-value" style:width={progressWidth}></div>
    </div>
  </div>
  <div class="project-footer">
    <small>{project.currentSnapshotId ? 'snapshot あり' : 'snapshot なし'}</small>
    <small>{project.latestProgressPercent ?? '--'}%</small>
  </div>
</button>

<style>
  .project-card {
    width: 100%;
    text-align: left;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid #e9ddd3;
    background: #fff;
    display: grid;
    gap: 10px;
    cursor: pointer;
  }

  .project-card.selected {
    border-color: #8f83ff;
    box-shadow: 0 0 0 2px rgba(110, 95, 255, 0.1);
  }

  .project-title-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .project-title-row strong {
    color: #443a33;
    font-size: 14px;
  }

  .project-title-row span {
    color: #ff7d2c;
    font-size: 11px;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: #7a6f66;
    font-size: 12px;
    line-height: 1.45;
    word-break: break-word;
  }

  .project-progress {
    display: grid;
    gap: 6px;
  }

  .project-progress span {
    color: #7a6f66;
    font-size: 11px;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: #f0e5db;
    overflow: hidden;
  }

  .progress-value {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff9f57, #ff6200);
  }

  .project-footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: #9a8d81;
    font-size: 11px;
  }
</style>
