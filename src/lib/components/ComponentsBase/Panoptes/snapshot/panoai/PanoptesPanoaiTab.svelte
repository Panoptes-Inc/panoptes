<script lang="ts">
  import type { PanoptesPanoaiData } from '$lib/panoptes/types';
  import { safeText } from '$lib/panoptes/utils/text';

  const PROMPT_FALLBACKS = ['競合との差を3つに整理して', '30日プランの優先順位を教えて', '業界構造の余白を要約して'];

  let { data }: { data: PanoptesPanoaiData } = $props();
</script>

<section class="panoai-tab">
  <article class="summary-card">
    <h2>PanoAI Summary</h2>
    <p>{safeText(data.summary, 'snapshot を踏まえて、競合差分と実行優先度を会話形式で深掘りできます。')}</p>
  </article>

  <div class="grid">
    <article>
      <h3>おすすめプロンプト</h3>
      <ul>
        {#each data.prompts as prompt, index}
          <li>{safeText(prompt, PROMPT_FALLBACKS[index] ?? 'プロンプト')}</li>
        {/each}
      </ul>
    </article>

    <article>
      <h3>コンテキストノート</h3>
      <ul>
        {#each data.contextNotes as note}
          <li>{safeText(note, '現行 snapshot に紐づく分析結果を参照')}</li>
        {/each}
      </ul>
    </article>
  </div>
</section>

<style>
  .panoai-tab {
    display: grid;
    gap: 14px;
  }

  .summary-card,
  .grid article {
    padding: 18px 20px;
    border-radius: 24px;
    border: 1px solid #ebddd2;
    background: #fff;
  }

  .summary-card h2,
  .summary-card p,
  .grid h3,
  .grid ul {
    margin: 0;
  }

  .summary-card p,
  li {
    color: #7b7067;
    line-height: 1.6;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  ul {
    padding-left: 18px;
    margin-top: 8px;
  }

  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
