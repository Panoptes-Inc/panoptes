<script lang="ts">
  import type { SelfAnalysisEvaluationCardData } from '../data/self-analysis-view-model';

  let { card }: { card: SelfAnalysisEvaluationCardData } = $props();
</script>

<article class:violet={card.tone === 'violet'} class="self-analysis-evaluation-card">
  <header>
    <h3>{card.title}</h3>
    <span>{card.accentLabel}</span>
  </header>

  <div class="content-body">
    <div class="summary-lines">
      {#each card.summaryLines as line}
        <p>{line}</p>
      {/each}
    </div>

    <ul>
      {#each card.bulletLines as line}
        <li>・{line}</li>
      {/each}
    </ul>
  </div>

  <small>{card.footerLabel}</small>
</article>

<style>
  .self-analysis-evaluation-card {
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 0 4px #00000016;
    padding: 8px;
    display: flex;
    flex-flow: column;
    flex: 1 1 0;
    min-height: 0;
    gap: 2px;
    align-content: stretch;
    overflow: hidden;
  }

  .self-analysis-evaluation-card.violet {
    border-color: #ddd8ff;
  }

  header {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
  }

  h3,
  span,
  p,
  ul,
  small {
    margin: 0;
  }

  h3 {
    color: #ff6d1d;
    font-size: 16px;
  }

  .self-analysis-evaluation-card.violet h3 {
    color: #7f79ff;
  }

  span {
    color: #6f6259;
    font-size: 12px;
    font-weight: 700;
  }

  .content-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scrollbar-gutter: stable;
  }

  .summary-lines {
    display: flex;
    flex-flow: column;
    gap: 2px;
  }

  p {
    color: #706259;
    font-size: 12px;
    font-weight: 500;
  }

  ul {
    display: flex;
    flex-flow: column;
  }

  li {
    font-size: 12px;
    color: #706259;
  }

  small {
    color: #8d7e74;
    font-size: 12px;
    flex: 0 0 auto;
  }
</style>
