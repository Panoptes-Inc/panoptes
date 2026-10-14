<script>
  import IndustryRatingMetricBarCard from './IndustryRatingMetricBarCard.svelte';

  let { metrics = [] } = $props();
</script>

<div class="metric-grid">
  {#each metrics as metric, index (`metric-${index}`)}
    <IndustryRatingMetricBarCard {metric} />
  {/each}
</div>

<style>
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    flex: 0.6;
  }

  @media (max-width: 720px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
