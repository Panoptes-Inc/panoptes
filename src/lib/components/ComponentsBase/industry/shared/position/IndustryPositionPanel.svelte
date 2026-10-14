<script>
  import IndustryPositionMatrix from './IndustryPositionMatrix.svelte';
  import IndustryPositionSummaryStack from './IndustryPositionSummaryStack.svelte';

  let { position } = $props();
</script>

<section class="position-panel" aria-label="市場ポジション分析">
  <header class="panel-head">
    <div class="head-grid">
      <h2>市場ポジション分析</h2>
      <p>戦略ポジションマップ</p>
    </div>
  </header>

  <div class="panel-grid">
    <IndustryPositionMatrix />
    <IndustryPositionSummaryStack
      cards={position?.cards ?? []}
      pressureLabel={position?.pressureLabel}
      insight={position?.insight}
    />
  </div>
</section>

<style>
  .position-panel {
    width: 100%;
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    display: flex;
    flex-flow: column;
    align-items: stretch;
    gap: 8px;
    flex: 1;
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
    display: flex;
    flex-flow: row;
    gap: 8px;
    align-items: stretch;
    flex: 1 1 auto;
  }

  @media (max-width: 960px) {
    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
