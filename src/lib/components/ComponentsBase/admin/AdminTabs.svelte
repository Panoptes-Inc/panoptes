<script lang="ts">
  import type { AdminTab } from './data/admin-data';

  let {
    activeTab,
    onTabChange
  }: {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
  } = $props();
</script>

<nav class="admin-tabs" aria-label="管理画面メニュー">
  <button
    type="button"
    class:active={activeTab === 'dashboard'}
    aria-pressed={activeTab === 'dashboard'}
    onclick={() => onTabChange('dashboard')}
  >
    ダッシュボード
  </button>
  <button
    type="button"
    class:active={activeTab === 'logs'}
    aria-pressed={activeTab === 'logs'}
    onclick={() => onTabChange('logs')}
  >
    ログ・監視
  </button>
</nav>

<style>
  .admin-tabs {
    display: flex;
    gap: 14px;
    padding: 8px 0;
  }

  button {
    min-width: 172px;
    min-height: 40px;
    padding: 9px 28px;
    border: 1px solid #aaa4ff;
    border-radius: 999px;
    background: linear-gradient(90deg, #aaa4ff, #8f87ff);
    color: #fff;
    font-size: 14px;
    transition: filter 0.18s ease, transform 0.18s ease;
  }

  button.active {
    border-color: #5b4dff;
    background: linear-gradient(90deg, #6659ff, #5144ff);
  }

  button:hover,
  button:focus-visible {
    filter: brightness(1.04);
  }

  button:focus-visible {
    outline: 3px solid rgba(86, 74, 255, 0.2);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .admin-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    button {
      min-width: 0;
      padding-inline: 14px;
    }
  }
</style>
