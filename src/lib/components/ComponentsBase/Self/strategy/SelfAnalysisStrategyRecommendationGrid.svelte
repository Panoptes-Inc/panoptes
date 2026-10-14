<script lang="ts">
  import type { SelfAnalysisImprovementCandidateCardData } from '../data/self-analysis-view-model';
  import SelfAnalysisStrategyRecommendationCard from './SelfAnalysisStrategyRecommendationCard.svelte';

  let {
    cards = []
  }: {
    cards?: SelfAnalysisImprovementCandidateCardData[];
  } = $props();
</script>

<section class="self-analysis-strategy-recommendation-grid">
  {#each cards as card, index (index)}
    <SelfAnalysisStrategyRecommendationCard {card} />
  {/each}
</section>

<style>
  .self-analysis-strategy-recommendation-grid {
    display: flex;
    gap: 8px;
    align-items: stretch;
    flex: 1 1;
  }

  @media (max-width: 1180px) {
    .self-analysis-strategy-recommendation-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
