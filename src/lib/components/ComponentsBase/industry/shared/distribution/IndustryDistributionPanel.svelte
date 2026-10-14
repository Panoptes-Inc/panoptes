<script>
  import IndustryDistributionRingCluster from './IndustryDistributionRingCluster.svelte';
  import IndustryDistributionSummaryColumn from './IndustryDistributionSummaryColumn.svelte';

  let { distribution } = $props();
</script>

<section class="distribution-panel" aria-label="型分布">
  <header class="panel-head">
    <div class="head-grid">
      <h2>型分布</h2>
      <p>企業ごとの型の構造分布</p>
    </div>
  </header>

  <div class="panel-grid">
    <IndustryDistributionRingCluster
      primary={distribution?.primary}
      secondary={distribution?.secondary ?? []}
    />

    <IndustryDistributionSummaryColumn
      stats={distribution?.stats ?? []}
      leaders={distribution?.leaders ?? []}
      insight={distribution?.insight}
    />
  </div>
</section>

<style>
  .distribution-panel {
    flex: 1;
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    gap: 8px;
    flex-flow: column;
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
  }

  .panel-head p {
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
    font-weight: 400;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(280px, 0.98fr);
    gap: 14px;
  }

  @media (max-width: 960px) {
    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
