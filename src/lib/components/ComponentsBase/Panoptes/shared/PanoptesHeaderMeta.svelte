<script lang="ts">
  let {
    meta = {
      tokenUsageRate: 64,
      memoryLabel: '記憶稼働中',
      projectDayCount: 24,
      projectDayMax: 90,
      aiModeLabel: 'デフォルト',
      tokenModeLabel: '高負荷',
      projectStatusLabel: '未保存',
      analyzedDateLabel: '----.--.--'
    },
    reanalyzeDisabled = false,
    onReanalyze = () => {}
  }: {
    meta?: {
      tokenUsageRate: number;
      memoryLabel: string;
      projectDayCount: number;
      projectDayMax: number;
      aiModeLabel: string;
      tokenModeLabel: string;
      projectStatusLabel: string;
      analyzedDateLabel: string;
    };
    reanalyzeDisabled?: boolean;
    onReanalyze?: () => void;
  } = $props();

  const progressWidth = $derived(`${Math.min(100, (meta.projectDayCount / meta.projectDayMax) * 100)}%`);
</script>

<div class="meta-strip">

  <div class="strategy-cluster">
    <span>Token使用量: {meta.tokenUsageRate}%</span>
    <span>戦略メモリ: {meta.memoryLabel}</span>
  </div>

  <div class="progress-pill">
  <div class="progress-bar">
    <strong>{meta.projectDayCount}日</strong>
    <div class="progress-track">
      <div class="progress-value" style:width={progressWidth}></div>
    </div>
  </div>
    <span>プロジェクト進行日数: {meta.projectDayCount}/{meta.projectDayMax}</span>
  </div>

  <div class="meta-cluster meta-right">
    <span>AI人格: {meta.aiModeLabel}</span>
    <span>Token使用モード: {meta.tokenModeLabel}</span>
    <span>プロジェクト状態: {meta.projectStatusLabel}</span>
  </div>

  <div class="actions">
    <button type="button" class="ghost" disabled>保存済</button>
    <button type="button" class="primary" onclick={onReanalyze} disabled={reanalyzeDisabled}>再分析</button>
  </div>
</div>

<style>
  .meta-strip {
    display: grid;
    grid-template-columns: auto auto auto auto;
    gap: 18px;
    align-items: center;
  }

  .strategy-cluster {
    display: flex;
    flex-flow: row;
    gap: 18px;
    color: #7b7067;
    font-size: 12px;
  }

  .meta-cluster {
    display: flex;
    flex-flow: column;
    color: #7b7067;
    font-size: 12px;
  }

  .meta-right {
    justify-content: flex-end;
  }

  .progress-pill {
    display: flex;
    align-items: center;
    flex-flow: column;
    color: #7b7067;
    font-size: 12px;
  }

  .progress-bar {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .progress-pill strong {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 46px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #bdb7ff;
    color: #fff;
  }

  .progress-track {
    width: 126px;
    height: 12px;
    border-radius: 999px;
    background: #ece9ff;
    overflow: hidden;
  }

  .progress-value {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #7e71ff, #c3bcff);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .actions button {
    border-radius: 999px;
    border: 0;
    min-width: 104px;
    min-height: 38px;
    padding: 0 18px;
    font-size: 14px;
    cursor: pointer;
  }

  .ghost {
    background: #9f9f9f;
    color: #fff;
  }

  .primary {
    background: linear-gradient(135deg, #ff9f57, #ff6200);
    color: #fff;
  }

  .primary:disabled,
  .ghost:disabled {
    opacity: 0.68;
    cursor: default;
  }

  @media (max-width: 1280px) {
    .meta-strip {
      grid-template-columns: 1fr;
      justify-items: start;
    }

    .meta-right,
    .actions {
      justify-content: flex-start;
    }
  }
</style>
