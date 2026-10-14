<script>
  import PanoptesAnalysisStartSearchBar from '$lib/components/ComponentsBase/PanoptesAnalysisStartSearchBar.svelte';

  let { onAnalyzed = () => {} } = $props();
</script>

<section class="top-search-area" aria-label="分析URL入力">
  <PanoptesAnalysisStartSearchBar {onAnalyzed} variant="hero" />
</section>

<style>
  .top-search-area {
    width: 100%;
    display: grid;
    justify-items: center;
  }
</style>
