<script lang="ts">
  import type { PanoptesAnalysisSnapshotPayload } from '$lib/panoptes/types';
  import CompetitorAnalysisCompareStage from './detail/CompetitorAnalysisCompareStage.svelte';
  import CompetitorAnalysisExpandedCard from './detail/CompetitorAnalysisExpandedCard.svelte';
  import {
    createCompetitorAnalysisViewModel,
    dummyCompetitorAnalysisViewModel
  } from './data/competitor-analysis-view-model';
  import CompetitorAnalysisCardGrid from './grid/CompetitorAnalysisCardGrid.svelte';
  import CompetitorAnalysisSummaryCard from './summary/CompetitorAnalysisSummaryCard.svelte';

  let {
    data = null,
    selectedCompetitorId = null,
    onSelectCompetitor = () => {},
    useDummyData = false
  }: {
    data?: PanoptesAnalysisSnapshotPayload['competitors'] | null;
    selectedCompetitorId?: string | null;
    onSelectCompetitor?: (competitorId: string) => void;
    useDummyData?: boolean;
  } = $props();

  let detailCompetitorId = $state<string | null>(null);
  let comparedCompetitorIds = $state<string[]>([]);

  const viewModel = $derived(
    useDummyData || !data ? dummyCompetitorAnalysisViewModel : createCompetitorAnalysisViewModel({ data })
  );
  const comparedCards = $derived(
    viewModel.cards.filter((card) => comparedCompetitorIds.includes(card.competitorId)).slice(0, 2)
  );
  const visibleCards = $derived(
    viewModel.cards.filter((card) => !comparedCompetitorIds.includes(card.competitorId))
  );
  const isCompareMode = $derived(comparedCards.length > 0);
  const detailCard = $derived(viewModel.cards.find((card) => card.competitorId === detailCompetitorId) ?? null);

  function handleOpenDetail(competitorId: string): void {
    if (detailCompetitorId === competitorId) {
      detailCompetitorId = null;
      return;
    }

    detailCompetitorId = competitorId;
    onSelectCompetitor(competitorId);
  }

  function handleOpenCompare(competitorId: string): void {
    detailCompetitorId = competitorId;
    onSelectCompetitor(competitorId);

    if (comparedCompetitorIds.includes(competitorId)) {
      comparedCompetitorIds = comparedCompetitorIds.filter((id) => id !== competitorId);
      return;
    }

    if (comparedCompetitorIds.length >= 2) {
      comparedCompetitorIds = [comparedCompetitorIds[1], competitorId];
      return;
    }

    comparedCompetitorIds = [...comparedCompetitorIds, competitorId];
  }
</script>

<section class="competitor-analysis-tab">
  <CompetitorAnalysisSummaryCard title={viewModel.summaryTitle} body={viewModel.summaryText} />

  <div class:compare-mode={isCompareMode} class="content-grid">
    <div class="card-grid-stage">
      <CompetitorAnalysisCardGrid
        cards={visibleCards}
        selectedCompetitorId={detailCompetitorId ?? selectedCompetitorId}
        {comparedCompetitorIds}
        compareCount={comparedCards.length}
        compact={isCompareMode}
        onOpenDetail={handleOpenDetail}
        onOpenCompare={handleOpenCompare}
      />
    </div>

    {#if detailCard && !comparedCompetitorIds.includes(detailCard.competitorId)}
      <div class="detail-stage-wrap">
        <CompetitorAnalysisExpandedCard
          card={detailCard}
          onOpenDetail={handleOpenDetail}
          onOpenCompare={handleOpenCompare}
        />
      </div>
    {/if}

    {#if isCompareMode}
      <div class="compare-stage-wrap" style={`--compare-count:${Math.max(comparedCards.length, 1)};`}>
        <CompetitorAnalysisCompareStage
          cards={comparedCards}
          onOpenDetail={handleOpenDetail}
          onOpenCompare={handleOpenCompare}
        />
      </div>
    {/if}
  </div>
</section>

<style>
  .competitor-analysis-tab {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .content-grid {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .content-grid.compare-mode {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .card-grid-stage {
    min-width: 0;
  }

  .compare-stage-wrap {
    box-sizing: border-box;
    width: calc((var(--compare-count) * 430px) + ((var(--compare-count) - 1) * 16px) + 8px);
    max-width: 100%;
    padding: 4px;
    overflow-x: auto;
  }

  .detail-stage-wrap {
    box-sizing: border-box;
    width: min(430px, 100%);
    padding: 4px;
  }

  @media (max-width: 1440px) {
    .content-grid.compare-mode {
      grid-template-columns: 1fr;
    }
  }
</style>
