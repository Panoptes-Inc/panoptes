<script>
  import IndustryOpportunityLaneCard from './IndustryOpportunityLaneCard.svelte';

  let { lanes = [] } = $props();
</script>

<div class="lane-grid">
  {#each lanes as lane, index (`lane-${index}`)}
    <IndustryOpportunityLaneCard {lane} />
  {/each}
</div>

<style>
  .lane-grid {
    display: flex;
    flex-flow: flow;
    gap: 8px;
    flex: 0.65;
    width: 100%;
  }

  @media (max-width: 720px) {
    .lane-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
