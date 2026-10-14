<script>
  import IndustryOpportunityLaneGrid from './IndustryOpportunityLaneGrid.svelte';
  import IndustryOpportunitySummaryColumn from './IndustryOpportunitySummaryColumn.svelte';

  let { opportunity } = $props();
</script>

<section class="opportunity-panel" aria-label="機会分析">
  <header class="panel-head">
    <div class="head-grid">
      <h2>機会分析</h2>
      <p>構造上の戦略余地</p>
    </div>
  </header>

  <div class="panel-grid">
    <IndustryOpportunityLaneGrid lanes={opportunity?.lanes ?? []} />
    <div class="summary-column">
      <IndustryOpportunitySummaryColumn {opportunity} />      
    </div>

  </div>
</section>

<style>
  .opportunity-panel {
    flex: 1;
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    flex-flow: column;
    gap: 8px;
  }
  .summary-column {
    flex: 0.35;
    display: flex;
    min-width: 0;
  }

  .head-grid {
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 8px;
  }

  .panel-head h2 {
    margin: 0;
    color: var(--industry-text, #3f3832);
    font-size: 16px;
    line-height: 1.15;
  }

  .panel-head p {
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
    font-weight: 400;
  }

  .panel-grid {
    display: flex;
    flex-flow: row;
    gap: 8px;
    align-items: stretch;
    min-height: 0;
    flex: 1 1 auto;
  }

  @media (max-width: 1080px) {
    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
