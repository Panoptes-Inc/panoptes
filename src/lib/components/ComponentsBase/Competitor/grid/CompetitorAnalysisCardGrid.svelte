<script lang="ts">
  import type { CompetitorAnalysisCardViewModel } from '../data/competitor-analysis-view-model';
  import CompetitorAnalysisCompanyCard from '../cards/CompetitorAnalysisCompanyCard.svelte';

  let {
    cards = [],
    selectedCompetitorId = null,
    comparedCompetitorIds = [],
    compareCount = 0,
    compact = false,
    onOpenDetail = () => {},
    onOpenCompare = () => {}
  }: {
    cards?: CompetitorAnalysisCardViewModel[];
    selectedCompetitorId?: string | null;
    comparedCompetitorIds?: string[];
    compareCount?: number;
    compact?: boolean;
    onOpenDetail?: (competitorId: string) => void;
    onOpenCompare?: (competitorId: string) => void;
  } = $props();

  const gridStyle = $derived.by(() => {
    const baseColumns = compact && compareCount >= 2 ? 4 : 5;
    const wideColumns = compact && compareCount >= 2 ? 3 : 4;
    return `--card-grid-columns:${baseColumns}; --card-grid-columns-wide:${wideColumns};`;
  });
</script>

<div class:compact class="card-grid" style={gridStyle}>
  {#each cards as card (card.competitorId)}
    <CompetitorAnalysisCompanyCard
      {card}
      selected={card.competitorId === selectedCompetitorId}
      compared={comparedCompetitorIds.includes(card.competitorId)}
      {compact}
      {onOpenDetail}
      {onOpenCompare}
    />
  {/each}
</div>

<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(var(--card-grid-columns, 5), minmax(0, 1fr));
    gap: 8px;
    align-content: start;
    align-items: stretch;
  }

  .card-grid.compact {
    gap: 10px;
  }

  @media (max-width: 1600px) {
    .card-grid {
      grid-template-columns: repeat(var(--card-grid-columns-wide, 4), minmax(0, 1fr));
    }
  }

  @media (max-width: 1280px) {
    .card-grid,
    .card-grid.compact {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .card-grid,
    .card-grid.compact {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .card-grid,
    .card-grid.compact {
      grid-template-columns: 1fr;
    }
  }
</style>
