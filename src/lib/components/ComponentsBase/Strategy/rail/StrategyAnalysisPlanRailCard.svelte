<script lang="ts">
  import type { StrategyAnalysisRailCardModel } from '../data/strategy-analysis-view-model';

  let {
    card,
    siteName,
    disabled = false,
    onSelect = () => {}
  }: {
    card: StrategyAnalysisRailCardModel;
    siteName: string;
    disabled?: boolean;
    onSelect?: (strategyKey: string) => void;
  } = $props();
</script>

<button
  type="button"
  class:selected={card.isSelected}
  class="strategy-plan-rail-card"
  disabled={disabled}
  onclick={() => onSelect(card.strategyKey)}
>
  <span class="project-label">プロジェクト名: {siteName}</span>
  <strong>{card.dayLabel}</strong>
  <div class="progress-track">
    <div class="progress-fill" style:width={`${card.progressPercent}%`}></div>
  </div>
  <p>{card.title}</p>
  <div class="meta-row">
    <span>{card.priorityLabel}</span>
    <em>{card.fitScoreLabel}</em>
  </div>
  <small>{card.statusLabel}</small>
</button>

<style>
  .strategy-plan-rail-card {
    width: 100%;
    text-align: left;
    border-radius: 18px;
    border: 1px solid #d9d2ff;
    background: #fff;
    box-shadow: 0 10px 20px rgba(71, 47, 21, 0.06);
    padding: 14px;
    display: grid;
    gap: 8px;
    cursor: pointer;
  }

  .strategy-plan-rail-card.selected {
    border-color: #8c80ff;
    box-shadow: 0 0 0 2px rgba(111, 94, 255, 0.12);
  }

  .project-label,
  strong,
  p,
  span,
  em,
  small {
    margin: 0;
  }

  .project-label {
    color: #7e7267;
    font-size: 11px;
  }

  strong {
    color: #4a3d36;
    font-size: 28px;
    line-height: 1;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: #ffe1cc;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ffbd94, #ff7e2a);
  }

  p {
    color: #4f4138;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.5;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: #7e7267;
    font-size: 11px;
  }

  em {
    font-style: normal;
  }

  small {
    justify-self: end;
    border-radius: 999px;
    background: #fff0e6;
    color: #ff6d1d;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
  }
</style>
