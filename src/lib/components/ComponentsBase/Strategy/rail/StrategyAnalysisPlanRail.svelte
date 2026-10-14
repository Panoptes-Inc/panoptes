<script lang="ts">
  import type { StrategyAnalysisRailCardModel } from '../data/strategy-analysis-view-model';
  import StrategyAnalysisPlanRailCard from './StrategyAnalysisPlanRailCard.svelte';

  let {
    siteName,
    cards = [],
    disabled = false,
    onSelectStrategyKey = () => {},
    onCreateProject = () => {}
  }: {
    siteName: string;
    cards?: StrategyAnalysisRailCardModel[];
    disabled?: boolean;
    onSelectStrategyKey?: (strategyKey: string) => void;
    onCreateProject?: () => void;
  } = $props();
</script>

<aside class="strategy-plan-rail">
  <header class="rail-header">
    <span>最終分析日時 : XXXX.XX.XX</span>
  </header>

  <div class="rail-stack">
    {#each cards as card}
      <StrategyAnalysisPlanRailCard
        {card}
        {siteName}
        {disabled}
        onSelect={onSelectStrategyKey}
      />
    {/each}

    <button type="button" class="add-card" onclick={onCreateProject}>
      <span>+</span>
      <strong>新しい分析を追加</strong>
    </button>
  </div>
</aside>

<style>
  .strategy-plan-rail {
    display: grid;
    gap: 10px;
    align-content: start;
  }

  .rail-header {
    display: flex;
    justify-content: end;
    color: #84776d;
    font-size: 12px;
  }

  .rail-stack {
    display: grid;
    gap: 12px;
  }

  .add-card {
    width: 100%;
    min-height: 140px;
    border-radius: 18px;
    border: 1px solid #ffe0cb;
    background: linear-gradient(180deg, #fff1e7, #ffe4d2);
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.4);
    display: grid;
    place-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .add-card span {
    color: #d9853e;
    font-size: 44px;
    line-height: 1;
  }

  .add-card strong {
    color: #d9853e;
    font-size: 14px;
  }
</style>
