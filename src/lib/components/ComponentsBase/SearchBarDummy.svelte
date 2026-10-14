<script lang="ts">
  import { dummyTopSearchSuggestions } from '$lib/db/dummy/panoptes_dummy_ui';

  let { onAnalyzed = null } = $props();

  let query = $state('');
  let isAnalyzing = $state(false);

  const hasText = $derived(query.trim().length > 0);
  const suggestions = $derived.by(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dummyTopSearchSuggestions.slice(0, 4);
    return dummyTopSearchSuggestions.filter((item) => item.toLowerCase().includes(normalized)).slice(0, 4);
  });

  function clear() {
    query = '';
  }

  function pickSuggestion(value: string) {
    query = value;
  }

  async function analyze() {
    if (!hasText || isAnalyzing) return;
    isAnalyzing = true;
    await new Promise((resolve) => setTimeout(resolve, 260));
    isAnalyzing = false;
    if (typeof onAnalyzed === 'function') onAnalyzed(query.trim());
  }
</script>

<section class="search-dummy" aria-label="開発用のアプリトップ検索">
  <div class="search-wrap">
    <input
      type="text"
      bind:value={query}
      placeholder="分析対象URLまたはプロジェクト名"
      onkeydown={(event) => event.key === 'Enter' && analyze()}
    />

    {#if hasText}
      <button type="button" class="clear-btn" onclick={clear} aria-label="入力をクリア">×</button>
    {/if}
  </div>

  <button type="button" class="analyze-btn" disabled={!hasText || isAnalyzing} onclick={analyze}>
    {isAnalyzing ? '分析中...' : '戦略分析を開始'}
  </button>

  {#if suggestions.length > 0}
    <ul class="suggestions">
      {#each suggestions as suggestion}
        <li>
          <button type="button" onclick={() => pickSuggestion(suggestion)}>{suggestion}</button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .search-dummy {
    width: min(420px, 100%);
    display: grid;
    gap: 10px;
  }

  .search-wrap {
    position: relative;
    width: 100%;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    min-height: 42px;
    padding: 11px 42px 11px 18px;
    border-radius: 999px;
    border: 1.5px solid #d7d1f3;
    background: #fff;
    color: #403631;
    font-size: 13px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
  }

  input:focus {
    outline: none;
    border-color: #8b83ff;
    box-shadow:
      0 0 0 3px rgba(86, 74, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.92);
  }

  .clear-btn {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
    color: #666;
    font-size: 15px;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .analyze-btn {
    width: 100%;
    min-height: 38px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(180deg, #ffb072, #ff8a42);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 10px 24px rgba(255, 137, 66, 0.18);
  }

  .analyze-btn:disabled {
    cursor: default;
    opacity: 0.55;
    background: linear-gradient(180deg, #d4d0cb, #a49f9a);
    box-shadow: none;
  }

  .suggestions {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .suggestions button {
    min-height: 28px;
    padding: 0 12px;
    border: 1px solid #e6e0ff;
    border-radius: 999px;
    background: #f4f1ff;
    color: #5f5bff;
    font-size: 11px;
    cursor: pointer;
  }
</style>
