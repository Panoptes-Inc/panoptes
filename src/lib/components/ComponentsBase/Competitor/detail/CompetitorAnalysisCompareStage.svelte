<script lang="ts">
  import type { CompetitorAnalysisCardViewModel } from '../data/competitor-analysis-view-model';
  import CompetitorAnalysisExpandedCard from './CompetitorAnalysisExpandedCard.svelte';

  let {
    cards = [],
    onOpenDetail = () => {},
    onOpenCompare = () => {}
  }: {
    cards?: CompetitorAnalysisCardViewModel[];
    onOpenDetail?: (competitorId: string) => void;
    onOpenCompare?: (competitorId: string) => void;
  } = $props();
</script>

<section class="compare-stage" style={`--compare-count:${Math.max(cards.length, 1)};`}>
  {#each cards as card (card.competitorId)}
    <CompetitorAnalysisExpandedCard {card} compared {onOpenDetail} {onOpenCompare} />
  {/each}
</section>

<style>
  .compare-stage {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: stretch;
    width: 100%;
  }

  @media (max-width: 1200px) {
    .compare-stage {
      flex-direction: column;
      width: 100%;
    }
  }
</style>
