<script lang="ts">
  import { goto } from '$app/navigation';
  import { createAndStartAnalysis } from '$lib/panoptes/actions/analysis';
  import { sessionUiStore } from '$lib/panoptes/stores/session';

  let {
    onAnalyzed = () => {},
    variant = 'default'
  }: {
    onAnalyzed?: () => void;
    variant?: 'default' | 'hero';
  } = $props();

  let targetUrl = $state('');

  const isBusy = $derived($sessionUiStore.createFlowStatus === 'submitting');
  const canSubmit = $derived(targetUrl.trim().length > 0 && !isBusy);
  const submitLabel = $derived(
    isBusy ? (variant === 'hero' ? '開始中...' : '分析中...') : variant === 'hero' ? '戦略分析を開始' : '分析する'
  );

  function clear(): void {
    targetUrl = '';
  }

  async function analyze(event?: SubmitEvent): Promise<void> {
    event?.preventDefault();
    if (!canSubmit) return;

    const result = await createAndStartAnalysis({ targetUrl });
    if (!result) return;

    targetUrl = '';
    await goto('/app/analysis');
    onAnalyzed();
  }
</script>

<form onsubmit={analyze}>
  <section class="search-area" class:hero={variant === 'hero'}>
    <div class="search-wrap" class:hero={variant === 'hero'}>
      <input
        class="search-input"
        class:hero={variant === 'hero'}
        type="url"
        placeholder="分析対象URL"
        bind:value={targetUrl}
      />

      {#if targetUrl.trim().length > 0}
        <button type="button" class="clear-btn" class:hero={variant === 'hero'} onclick={clear} aria-label="入力をクリア" title="クリア">
          ×
        </button>
      {/if}
    </div>

    <button class="analyze-button" class:is-ready={canSubmit} class:hero={variant === 'hero'} type="submit" disabled={!canSubmit}>
      {submitLabel}
    </button>
  </section>
</form>

<style>
  form {
    width: 100%;
  }

  .search-area {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  .search-area.hero {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .search-wrap {
    position: relative;
    width: min(640px, calc(100vw - 120px));
  }

  .search-wrap.hero {
    width: 100%;
  }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    font-size: 12px;
    padding: 16px 44px 16px 32px;
    border-radius: 80px;
    border: 1px solid #a3a3a3;
    background: #fff;
    outline: none;
  }

  .search-input.hero {
    min-height: 36px;
    padding: 10px 40px 10px 20px;
    border: 1.5px solid #d7d1f3;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
  }

  .clear-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
    display: grid;
    place-items: center;
    font-size: 18px;
    line-height: 1;
    color: #666;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease, color 0.15s ease;
  }

  .clear-btn.hero {
    width: 22px;
    height: 22px;
    right: 12px;
    font-size: 16px;
  }

  .clear-btn:hover {
    background: #fff;
    color: #2d2d2d;
    transform: translateY(-50%) scale(1.06);
  }

  .clear-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(86, 74, 255, 0.14);
  }

  .analyze-button {
    --r: 999px;
    --padX: 32px;
    --padY: 12px;
    --gap: 2px;
    --ring: 2px;

    background: linear-gradient(90deg, #8b83ff, #564aff);
    color: #fff;
    border: none;
    padding: var(--padY) var(--padX);
    border-radius: var(--r);
    font-size: 12px;
    position: relative;
    isolation: isolate;
    z-index: 0;
    cursor: pointer;
  }

  .analyze-button.hero {
    width: 100%;
    min-height: 36px;
    padding: 10px 18px;
    font-size: 11px;
    background: linear-gradient(180deg, #ffb072, #ff8a42);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 10px 24px rgba(255, 137, 66, 0.18);
  }

  .analyze-button::before {
    content: '';
    position: absolute;
    inset: calc(-1 * (var(--gap) + var(--ring)));
    border-radius: inherit;
    background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
    background-size: 300% 300%;
    background-position: 0% 50%;
    padding: var(--ring);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    z-index: -2;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    animation: none;
  }

  .analyze-button.is-ready::before {
    opacity: 1;
    animation: glow 12s linear infinite;
  }

  .analyze-button:not(.is-ready) {
    opacity: 0.55;
    background: linear-gradient(90deg, #7d7d7d, #313131);
  }

  .analyze-button.hero:not(.is-ready) {
    background: linear-gradient(180deg, #d4d0cb, #a49f9a);
  }

  .analyze-button:disabled {
    cursor: not-allowed;
  }

  @keyframes glow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .search-input:hover {
    border-color: #8b83ff;
  }

  .search-input:focus {
    border-color: #564aff;
    box-shadow:
      0 0 0 3px rgba(86, 74, 255, 0.12),
      0 6px 18px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 720px) {
    .search-area {
      flex-direction: column;
      align-items: stretch;
    }

    .search-wrap {
      width: 100%;
    }
  }
</style>
