<script lang="ts">
  import type { SelfAnalysisImprovementCandidateCardData } from '../data/self-analysis-view-model';

  let { card }: { card: SelfAnalysisImprovementCandidateCardData } = $props();
</script>

<article class="self-analysis-strategy-recommendation-card">
  <header>
    <span>{card.rankLabel}</span>
    <h3>{card.title}</h3>
  </header>

  <p class="summary">{card.summary}</p>

  <div class="block">
    <strong>判断材料</strong>
    <ul>
      {#each card.evidenceLines as line, index (index)}
        <li>{line}</li>
      {/each}
    </ul>
  </div>

  <div class="block">
    <strong>実行アクション</strong>
    <ul>
      {#each card.actionLines as line, index (index)}
        <li>{line}</li>
      {/each}
    </ul>
  </div>

  <div class="impact-list">
    {#each card.impactLines as line, index (index)}
      <small>{line}</small>
    {/each}
  </div>
</article>

<style>
  .self-analysis-strategy-recommendation-card {
    border-radius: 8px;
    background: linear-gradient(180deg, #a59cff, #7d73ff);
    color: #fff;
    box-shadow: 0 0 4px #00000016;
    padding: 8px;
    display: flex;
    flex-flow: column;
    gap: 8px;
    min-height: 100%;
    flex: 1;
  }

  header,
  .block,
  .impact-list {
    display: flex;
    flex-flow: column;
    gap: 2px;
  }

  span,
  h3,
  p,
  strong,
  ul,
  small {
    margin: 0;
  }

  span,
  strong {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  h3 {
    font-size: 16px;
  }

  .summary,
  li {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.94);
  }

  ul {
    display: grid;
    gap: 4px;
  }

  .impact-list {
    display: flex;
    flex-flow: row wrap;
    gap: 8px;
    align-self: end;
  }

  .impact-list small {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
  }
</style>
