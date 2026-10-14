<script lang="ts">
  import type { StrategyAnalysisOverviewModel } from '../data/strategy-analysis-view-model';
  import StrategyAnalysisFitGauge from './StrategyAnalysisFitGauge.svelte';

  let { overview }: { overview: StrategyAnalysisOverviewModel } = $props();
</script>

<section class="strategy-overview-panel">
  <header class="section-header">
    <h2>戦略進捗</h2>
  </header>

  <div class="overview-grid">
    <div class="fit-grid">
      <article class="fit-card">
        <p class="label">戦略適合指数</p>
        <StrategyAnalysisFitGauge value={overview.fitIndex} />
      </article>
      <article class="footer-card">
        <span>現在の戦略テーマ</span>
            <div class="card-contents">
              <strong>{overview.currentTheme}</strong>
            </div>        
      </article>
      <article class="footer-card">
        <span>構造リスク</span>
            <div class="card-contents">
              <strong>{overview.structureRiskLabel}</strong>              
            </div>        
      </article>
    </div>
    <div class="stat-insight">
      <div class="stat-grid">
        <div class="stat-grid-top">
          <article class="stat-card">
            <span>市場競争圧</span>
            <div class="card-contents">
              <strong>{overview.marketPressureLabel}</strong>
            </div>
          </article>
          <article class="stat-card">
            <span>業界平均差</span>
            <div class="card-contents">
              <strong>{overview.industryGapLabel}</strong>
            </div>
          </article>
        </div>
        <div class="stat-grid-bottom">
          <article class="stat-card">
            <span>戦略状態</span>
            <div class="card-contents">
              <div class="stat-card-contents-warp">
                <strong>前回 : {overview.previousFitIndex}</strong>
                <em>改善中 {overview.fitDelta >= 0 ? '+' : ''}{overview.fitDelta}</em>              
              </div>
            </div>
          </article>
        </div>  
      </div>
      <article class="insight-card">
        <span>戦略状態 AI 評価</span>
        <p>{overview.aiSummary}</p>
      </article>       
    </div>
    
  </div>

  
</section>

<style>
  .strategy-overview-panel {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 244, 0.98));
    box-shadow: 0 0px 4px #00000016;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .fit-grid {
    flex: 0 1 300px;
    min-width: 300px;
    width: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-header h2,
  .label,
  .stat-card span,
  .stat-card strong,
  .stat-card em,
  .insight-card span,
  .insight-card p,
  .footer-card span,
  .footer-card strong {
    margin: 0;
  }

  .card-contents {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
  }

  .card-contents strong,
  .card-contents em {
    flex: 1;
  }

  .stat-card-contents-warp {
    display: flex;
    flex-flow: column;
    text-align: center;
    gap: 8px;
  }

  .section-header h2 {
    color: #43352e;
    font-size: 18px;
  }

  .overview-grid {
    flex: 1 1 auto;
    display: flex;
    flex-flow:row nowrap;
    gap: 8px;
    align-items: stretch;
  }

  .stat-card,
  .insight-card,
  .footer-card {
    border-radius: 8px;
    background: #fff;
    padding: 8px;
    box-shadow: 0 0px 4px #00000016;
    flex: 1;
  }

  .fit-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .label,
  .stat-card span,
  .insight-card span,
  .footer-card span {
    color: #7c6f66;
    font-size: 16px;
    font-weight: 700;
  }

  .stat-grid {
    display: flex;
    flex-flow: row;
    justify-content: center;
    gap: 8px;
  }

  .stat-grid-top {
    width: 100%;
    display: flex;
    flex-flow: column;
    gap: 8px;
  }

  .stat-grid-bottom {
    width: 100%;
    display: flex;
    flex-flow: column;
    gap: 10px;
  }

  .stat-insight {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column;
    gap: 8px;
  }

  .stat-card {
    flex: 1;
    display: flex;
    flex-flow: column;
  }

  .stat-card strong {
    color: #6f5dff;
    font-size: 24px;
    line-height: 1.1;
  }

  .stat-card-contents-warp strong {
    color: #6f5dff;
    font-size: 20px;
    line-height: 1.1;
  }

  .stat-card em {
    color: #ffffff;
    padding: 2px 12px;
    font-size: 16px;
    background: linear-gradient(to right ,#FF8A41 ,#FF6200);
    font-style: normal;
    font-weight: 400;
    border-radius: 999px;
  }

  .insight-card {
    gap: 8px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .insight-card p {
    color: #6f645d;
    font-size: 13px;
    line-height: 1.7;
  }

  .footer-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer-card strong {
    color: #ff6d1d;
    font-size: 18px;
    line-height: 1.3;
  }

  @media (max-width: 1180px) {
    .fit-grid,
    .stat-grid,
    .stat-card,
    .insight-card {
      flex-basis: 100%;
    }

    .fit-card {
      align-items: flex-start;
    }
  }
</style>
