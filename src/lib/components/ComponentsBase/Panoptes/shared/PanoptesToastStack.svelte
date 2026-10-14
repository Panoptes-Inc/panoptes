<script lang="ts">
  import { removeToast } from '$lib/panoptes/actions/network';

  type Toast = {
    id: string;
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
  };

  let { toasts = [] }: { toasts?: Toast[] } = $props();
</script>

{#if toasts.length > 0}
  <div class="toast-stack" aria-live="polite" aria-label="通知">
    {#each toasts as toast (toast.id)}
      <article class={`toast toast-${toast.level}`}>
        <p>{toast.message}</p>
        <button type="button" class="toast-close" onclick={() => removeToast(toast.id)}>×</button>
      </article>
    {/each}
  </div>
{/if}

<style>
  .toast-stack {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 120;
    display: grid;
    gap: 10px;
    width: min(360px, calc(100vw - 32px));
  }

  .toast {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: start;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 18px 48px rgba(42, 34, 18, 0.14);
    backdrop-filter: blur(18px);
    background: rgba(255, 255, 255, 0.88);
  }

  .toast p {
    margin: 0;
    color: #453d36;
    font-size: 13px;
    line-height: 1.5;
  }

  .toast-info {
    border-color: rgba(104, 95, 255, 0.18);
  }

  .toast-success {
    border-color: rgba(255, 110, 22, 0.24);
  }

  .toast-warning {
    border-color: rgba(255, 177, 59, 0.32);
  }

  .toast-error {
    border-color: rgba(241, 91, 66, 0.28);
  }

  .toast-close {
    border: 0;
    background: transparent;
    color: #7b7067;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
</style>
