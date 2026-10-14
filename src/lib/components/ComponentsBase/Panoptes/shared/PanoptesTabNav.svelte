<script lang="ts">
  type TabItem = {
    id: string;
    label: string;
  };

  let {
    tabs = [],
    activeTab = 'strategy',
    onChange = () => {}
  }: {
    tabs?: TabItem[];
    activeTab?: string;
    onChange?: (tabId: string) => void;
  } = $props();
</script>

<nav class="tab-nav" aria-label="分析タブ">
  {#each tabs as tab}
    <button type="button" class:active={tab.id === activeTab} onclick={() => onChange(tab.id)}>
      {tab.label}
    </button>
  {/each}
</nav>

<style>
  .tab-nav {
    display: flex;
    flex-wrap: nowrap;
    gap: 12px;
    align-items: center;
  }

  .tab-nav button {
    display: flex;
    justify-content: center;
    flex-flow: row;
    align-items: center;
    text-align: center;
    min-width: 92px;
    border: 0;
    border-radius: 999px;
    padding: 8px 40px;
    background: linear-gradient(135deg, #c8c2ff, #a7a0ff);
    color: #fff;
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.4em;
    text-indent: 0.4em;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .tab-nav button.active {
    background: linear-gradient(135deg, #6a5cff, #4f43ff);
    box-shadow: 0 10px 20px rgba(92, 80, 255, 0.18);
  }

  .tab-nav button:hover {
    transform: translateY(-1px);
  }
</style>
