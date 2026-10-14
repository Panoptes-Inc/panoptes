<script lang="ts">
  import type { StrategyAnalysisImprovementModel } from '../data/strategy-analysis-view-model';
  import StrategyAnalysisImprovementMeter from './StrategyAnalysisImprovementMeter.svelte';

  let { improvement }: { improvement: StrategyAnalysisImprovementModel } = $props();
</script>

<section class="strategy-improvement-section">
  <header class="section-header">
    <h2>戦略改善余地</h2>
  </header>

  <StrategyAnalysisImprovementMeter
    percent={improvement.improvementPercent}
  />

  <div class="body-grid">
    <article class="focus-card">
      <div class="focus-head">
        <span>{improvement.rankLabel}</span>
        <h3>{improvement.title}</h3>
      </div>

      <p>{improvement.overview}</p>

      <div class="divider"></div>

      <div class="block">
        <strong>戦略意図</strong>
        <ul>
          {#each improvement.rationale as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>

      <div class="divider"></div>

      <div class="block">
        <strong>具体的アクション</strong>
        <ul>
          {#each improvement.actions as item}
            <li>{item}</li>
          {/each}
        </ul>
      </div>

      <div class="divider"></div>

      <div class="impact">
        <strong>期待インパクト</strong>
        <div class="impact-pills">
          {#each improvement.impact as item}
            <span>{item}</span>
          {/each}
        </div>
      </div>
    </article>

    <article class="ai-card">
      <span class="eyebrow">Panoptes AI</span>
      <h3>現在のポジションは「挑戦者」です。</h3>
      <p>{improvement.aiSummary}</p>
    </article>
  </div>
</section>

<style>
  .divider {
    height: 0.5px;
    background: #ffffff40;
    width: 100%;
    margin-top: 2px;
  }

  .strategy-improvement-section {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 244, 0.98));
    box-shadow: 0 0 4px #00000016;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-header h2,
  .focus-head span,
  .focus-head h3,
  .focus-card p,
  .block strong,
  .block ul,
  .impact strong,
  .ai-card h3,
  .ai-card p,
  .eyebrow {
    margin: 0;
  }

  .section-header h2 {
    color: #43352e;
    font-size: 18px;
  }

  .body-grid {
    flex: 1 1 auto;
    display: flex;
    flex-flow: row;
    gap: 8px;
    align-items: stretch;
  }

  .focus-card,
  .ai-card {
    border-radius: 8px;
    padding: 8px;
    height: 100%;
  }

  .focus-card {
    background: linear-gradient(180deg, #9488ff, #6e63ff);
    color: #fff;
    flex: 320px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .focus-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .focus-head span {
    font-size: 12px;
    opacity: 0.84;
    font-weight: 700;
  }

  .focus-head h3 {
    font-size: 14px;
    line-height: 1.2;
  }

  .focus-card p,
  .block li {
    font-size: 12px;
    line-height: 1.2;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .block strong,
  .impact strong {
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .block ul {
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .impact {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .impact-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .impact-pills span {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
  }

  .ai-card {
    border: 1px solid #eee4da;
    background: #fff;
    flex: 0 1 320px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .eyebrow {
    color: #ff6d1d;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  .ai-card h3 {
    color: #4b3d35;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-indent: 0.1em;
  }

  .ai-card p {
    color: #65574f;
    font-size: 15px;
    line-height: 1.8;
  }

  @media (max-width: 1120px) {
    .focus-card,
    .ai-card {
      flex-basis: 100%;
    }
  }
</style>
