<script lang="ts">
  import type { CompetitorAnalysisCardViewModel } from '../data/competitor-analysis-view-model';
  import {
    createCompetitorCompanyActionLabels,
    createCompetitorCompanyScoreRing,
    formatCompetitorScorePercentage
  } from '../data/competitor-card-presentation';

  let {
    card,
    selected = false,
    compared = false,
    compact = false,
    onOpenDetail = () => {},
    onOpenCompare = () => {}
  }: {
    card: CompetitorAnalysisCardViewModel;
    selected?: boolean;
    compared?: boolean;
    compact?: boolean;
    onOpenDetail?: (competitorId: string) => void;
    onOpenCompare?: (competitorId: string) => void;
  } = $props();

  const scoreRing = $derived(createCompetitorCompanyScoreRing(card.overallScore));
  const actionLabels = $derived(createCompetitorCompanyActionLabels(compared));
</script>

<article
  class:selected
  class:compared
  class:compact
  class="company-card"
  aria-label={`${card.companyName} ${card.serviceName}の競合サマリー`}
>
  <div class="card-copy">
    <h3>{card.companyName} | {card.serviceName}</h3>
  </div>

  <div class="score-row">
    <div class="score-ring" style:background={scoreRing} role="img" aria-label={`総合スコア ${card.overallScore}`}>
      <div class="score-ring-inner">{card.overallScore}</div>
    </div>

    <div class="score-copy">
      <strong>{card.marketTypeLabel}</strong>
      <span>{card.marketPositionSummary}</span>
    </div>
  </div>

  <div class="metric-stack">
    <div class="metric-row">
      <span class="metric-label">内部構造スコア</span>
      <small>{card.internalStructureScore}</small>
      <div class="bar-track">
        <div
          class="bar-fill orange"
          style:width={formatCompetitorScorePercentage(card.internalStructureScore)}
        ></div>
      </div>
    </div>

    <div class="metric-row">
      <span class="metric-label">ビジュアルスコア</span>
      <small>{card.visualScore}</small>
      <div class="bar-track">
        <div class="bar-fill violet" style:width={formatCompetitorScorePercentage(card.visualScore)}></div>
      </div>
    </div>
  </div>

  <footer class="footer-actions">
    <button
      type="button"
      class="detail"
      aria-pressed={selected}
      onclick={() => onOpenDetail(card.competitorId)}>{actionLabels.detail}</button
    >
    <button
      type="button"
      class="compare"
      aria-pressed={compared}
      onclick={() => onOpenCompare(card.competitorId)}
    >
      {actionLabels.compare}
    </button>
  </footer>
</article>

<style>
  .company-card {
    width: 180px;
    height: 240px;
    padding: 8px;
    border-radius: 8px;
    background: #fff;
    display: grid;
    grid-template-rows: minmax(0, auto) auto auto auto;
    gap: 8px;
    height: 100%;
    box-shadow: 0 0 4px #00000016;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      background 180ms ease;
  }

  .company-card.selected {
    border-color: #ffb98d;
    box-shadow: 0 0 0 2px rgba(255, 122, 26, 0.14);
  }

  .company-card.compared {
    border-color: #b8b0ff;
    box-shadow: 0 0 0 2px rgba(125, 115, 255, 0.12);
  }

  .company-card.compact {
    padding: 8px;
    gap: 8px;
    min-height: 240px;
  }

  .card-copy h3,
  .score-copy span,
  .metric-row .metric-label,
  .metric-row small {
    margin: 0;
  }

  .card-copy h3 {
    margin: 0;
    color: #53473f;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .score-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    align-items: center;
  }

  .score-ring {
    width: 72px;
    height: 72px;
    border-radius: 999px;
    padding: 5px;
    display: grid;
    place-items: center;
  }

  .score-ring-inner {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: #fff;
    display: grid;
    place-items: center;
    color: #4b413a;
    font-size: 18px;
    font-weight: 800;
  }

  .score-copy {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .score-copy strong {
    color: #ff7a1a;
    font-size: 13px;
    line-height: 1.35;
  }

  .score-copy span {
    color: #8b7f76;
    font-size: 11px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .metric-stack {
    display: grid;
    gap: 9px;
  }

  .metric-row {
    display: grid;
    gap: 4px;
  }

  .metric-row .metric-label {
    color: #5c5047;
    font-size: 11px;
    font-weight: 700;
  }

  .metric-row small {
    color: #ff7a1a;
    font-size: 11px;
    font-weight: 700;
  }

  .bar-track {
    height: 6px;
    border-radius: 999px;
    background: #f2e7df;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: inherit;
  }

  .bar-fill.orange {
    background: linear-gradient(90deg, #ffb17a, #ff7a1a);
  }

  .bar-fill.violet {
    background: linear-gradient(90deg, #cbc5ff, #7d73ff);
  }

  .footer-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: auto;
  }

  .footer-actions button {
    min-height: 28px;
    border: 0;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .footer-actions .detail {
    background: linear-gradient(180deg, #ffb17a, #ff8b43);
    color: #fff;
  }

  .footer-actions .compare {
    background: linear-gradient(180deg, #d1cbff, #b6adff);
    color: #fff;
  }

  .company-card.compact .card-copy h3,
  .company-card.compact .score-copy strong,
  .company-card.compact .score-copy span,
  .company-card.compact .metric-row .metric-label,
  .company-card.compact .metric-row small {
    font-size: 10px;
  }

  .company-card.compact .score-row {
    gap: 8px;
  }

  .company-card.compact .score-ring {
    width: 54px;
    height: 54px;
    padding: 4px;
  }

  .company-card.compact .score-ring-inner {
    font-size: 15px;
  }

  .company-card.compact .footer-actions button {
    min-height: 24px;
    font-size: 10px;
  }
</style>
