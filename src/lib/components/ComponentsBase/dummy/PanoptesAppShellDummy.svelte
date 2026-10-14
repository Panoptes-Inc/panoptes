<script lang="ts">
  import HeaderDummy from '../HeaderDummy.svelte';
  import SearchBarDummy from '../SearchBarDummy.svelte';
  import PanoptesProjectSidebar from '../Panoptes/project-list/PanoptesProjectSidebar.svelte';
  import PanoptesHeaderMeta from '../Panoptes/shared/PanoptesHeaderMeta.svelte';
  import PanoptesTabNav from '../Panoptes/shared/PanoptesTabNav.svelte';
  import PanoptesSnapshotSurface from '../Panoptes/snapshot/PanoptesSnapshotSurface.svelte';
  import PanoptesTopHeroBrand from '../top/hero/PanoptesTopHeroBrand.svelte';
  import {
    dummyAppTopCopy,
    dummyHeaderMeta,
    dummyProjectSummaries,
    dummySnapshot
  } from '$lib/db/dummy/panoptes_dummy_ui';

  type SnapshotTabId = 'competitor' | 'industry' | 'self' | 'strategy' | 'panoai';

  const SNAPSHOT_TABS = [
    { id: 'competitor', label: '競合' },
    { id: 'industry', label: '業界' },
    { id: 'self', label: '自社' },
    { id: 'strategy', label: '戦略' },
    { id: 'panoai', label: 'PanoAI' }
  ] satisfies Array<{ id: SnapshotTabId; label: string }>;

  let {
    activePath = '/app',
    withHeader = true,
    showHero = false,
    showSidebar = true,
    initialTab = 'industry'
  }: {
    activePath?: string;
    withHeader?: boolean;
    showHero?: boolean;
    showSidebar?: boolean;
    initialTab?: SnapshotTabId;
  } = $props();

  let activeTab = $state<SnapshotTabId>('strategy');
  let selectedCompetitorId = $state(dummySnapshot.competitors.cards[0]?.competitorId ?? null);

  const selectedPlan = $derived(dummySnapshot.strategyPlans[0] ?? null);
  const selectedPlanTasks = $derived(
    dummySnapshot.phaseTasks.filter((task) => task.strategyPlanId === selectedPlan?.strategyPlanId)
  );

  $effect(() => {
    activeTab = initialTab;
  });
</script>

<main class="app-dummy-shell">
  {#if withHeader}
    <HeaderDummy {activePath} />
  {/if}

  {#if showHero}
    <section class="hero-card">
      <div class="hero-stage">
        <PanoptesTopHeroBrand />
        <SearchBarDummy />
        <p class="hero-note">{dummyAppTopCopy.note}</p>
      </div>
    </section>
  {/if}

  <section class="shell-card">
    <div class="shell-card-top">
      <div class="shell-copy">
        <p>{dummyAppTopCopy.shellTitle}</p>
        <span>{dummyAppTopCopy.shellBody}</span>
      </div>

      <PanoptesTabNav tabs={SNAPSHOT_TABS} activeTab={activeTab} onChange={(tabId) => (activeTab = tabId as SnapshotTabId)} />
      <PanoptesHeaderMeta meta={dummyHeaderMeta} reanalyzeDisabled={false} />
    </div>

    <div class="shell-body" class:single-column={!showSidebar}>
      <div class="main-panel">
        <PanoptesSnapshotSurface
          snapshot={dummySnapshot}
          {activeTab}
          {selectedCompetitorId}
          onSelectCompetitor={(competitorId) => (selectedCompetitorId = competitorId)}
          {selectedPlan}
          allStrategyTasks={selectedPlanTasks}
        />
      </div>

      {#if showSidebar}
        <aside class="sidebar-panel">
          <PanoptesProjectSidebar
            projects={dummyProjectSummaries}
            selectedProjectId={dummyProjectSummaries[0]?.projectId ?? null}
          />
        </aside>
      {/if}
    </div>
  </section>
</main>

<style>
  .app-dummy-shell {
    width: min(1680px, 100%);
    display: grid;
    gap: 18px;
    padding: 10px 16px 18px;
    background: #f8f3ee;
  }

  .hero-card,
  .shell-card {
    border-radius: 28px;
    border: 1px solid #e8ddd3;
    background: rgba(255, 251, 247, 0.96);
    box-shadow: 0 18px 40px rgba(54, 36, 16, 0.08);
  }

  .hero-card {
    padding: 26px 20px;
  }

  .hero-stage {
    width: min(420px, 100%);
    margin: 0 auto;
    display: grid;
    justify-items: center;
    gap: 16px;
  }

  .hero-note {
    margin: 0;
    color: #ff8a42;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: center;
  }

  .shell-card {
    padding: 18px;
    display: grid;
    gap: 16px;
  }

  .shell-card-top {
    display: grid;
    gap: 14px;
  }

  .shell-copy {
    display: grid;
    gap: 4px;
  }

  .shell-copy p,
  .shell-copy span {
    margin: 0;
  }

  .shell-copy p {
    color: #403631;
    font-size: 15px;
    font-weight: 700;
  }

  .shell-copy span {
    color: #7b7067;
    font-size: 12px;
    line-height: 1.6;
  }

  .shell-body {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.4fr);
    gap: 16px;
    align-items: start;
  }

  .shell-body.single-column {
    grid-template-columns: 1fr;
  }

  .main-panel,
  .sidebar-panel {
    min-width: 0;
  }

  .sidebar-panel {
    padding: 16px;
    border-radius: 24px;
    border: 1px solid #ece1d7;
    background: rgba(255, 251, 247, 0.96);
  }

  @media (max-width: 1100px) {
    .shell-body {
      grid-template-columns: 1fr;
    }
  }
</style>
