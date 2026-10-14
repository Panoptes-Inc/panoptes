<script lang="ts">
  import AdminConsole from '$lib/components/ComponentsBase/AdminConsole.svelte';
  import PanoptesAnalysisSurface from '$lib/components/ComponentsBase/Panoptes/analysis/PanoptesAnalysisSurface.svelte';
  import PanoptesSnapshotSurface from '$lib/components/ComponentsBase/Panoptes/snapshot/PanoptesSnapshotSurface.svelte';
  import PanoptesTabNav from '$lib/components/ComponentsBase/Panoptes/shared/PanoptesTabNav.svelte';
  import PanoptesAppShellDummy from '$lib/components/ComponentsBase/dummy/PanoptesAppShellDummy.svelte';
  import type { PanoptesVisibleStep } from '$lib/panoptes/types';
  import {
    analysisPreviewInferenceDraft,
    analysisPreviewPresentations,
    createAnalysisPreviewRuntime,
    previewSnapshot
  } from './panoptes-ui-preview-data';

  type PreviewMode = 'top' | 'analysis' | 'snapshot' | 'admin';
  type SnapshotPreviewTab = 'competitor' | 'industry' | 'self' | 'strategy' | 'panoai';

  const previewModeTabs = [
    { id: 'top', label: 'App Top' },
    { id: 'analysis', label: '分析中 5画面' },
    { id: 'snapshot', label: '結果タブ' },
    { id: 'admin', label: 'Admin' }
  ];

  const analysisTabs: Array<{ id: PanoptesVisibleStep; label: string }> = [
    { id: 'target_scan', label: 'URL解析' },
    { id: 'inference_review', label: '推定確認' },
    { id: 'competitor_analysis', label: '競合分析' },
    { id: 'industry_analysis', label: '業界分析' },
    { id: 'strategy_synthesis', label: '戦略生成' }
  ];

  const snapshotTabs: Array<{ id: SnapshotPreviewTab; label: string }> = [
    { id: 'competitor', label: '競合' },
    { id: 'industry', label: '業界' },
    { id: 'self', label: '自社' },
    { id: 'strategy', label: '戦略' },
    { id: 'panoai', label: 'PanoAI' }
  ];

  let previewMode = $state<PreviewMode>('top');
  let analysisStep = $state<PanoptesVisibleStep>('target_scan');
  let snapshotTab = $state<SnapshotPreviewTab>('competitor');
  let selectedCompetitorId = $state(previewSnapshot.competitors.cards[0]?.competitorId ?? null);

  const analysisRuntime = $derived(createAnalysisPreviewRuntime(analysisStep));
  const selectedPlan = $derived(previewSnapshot.strategyPlans[0] ?? null);
  const selectedPlanTasks = $derived(
    previewSnapshot.phaseTasks.filter((task) => task.strategyPlanId === selectedPlan?.strategyPlanId)
  );
</script>

<main class="preview-page">
  <section class="preview-header-card">
    <div class="preview-copy">
      <p class="eyebrow">UI Preview</p>
      <h1>Panoptes 開発用プレビュー</h1>
      <p>app top、分析中5画面、snapshot 全タブ、admin を dummy seed ベースで切り替え表示できます。</p>
    </div>

    <PanoptesTabNav tabs={previewModeTabs} activeTab={previewMode} onChange={(tabId) => (previewMode = tabId as PreviewMode)} />

    {#if previewMode === 'analysis'}
      <PanoptesTabNav tabs={analysisTabs} activeTab={analysisStep} onChange={(tabId) => (analysisStep = tabId as PanoptesVisibleStep)} />
    {:else if previewMode === 'snapshot'}
      <PanoptesTabNav tabs={snapshotTabs} activeTab={snapshotTab} onChange={(tabId) => (snapshotTab = tabId as SnapshotPreviewTab)} />
    {/if}
  </section>

  {#if previewMode === 'top'}
    <section class="top-preview-stage">
      <PanoptesAppShellDummy withHeader={false} showHero showSidebar initialTab="industry" />
    </section>
  {:else if previewMode === 'analysis'}
    <section class="analysis-preview-stage">
      <div class="analysis-preview-frame">
        <PanoptesAnalysisSurface
          variant="flow"
          runtime={analysisRuntime}
          presentation={analysisPreviewPresentations[analysisStep]}
          inferenceDraft={analysisStep === 'inference_review' ? analysisPreviewInferenceDraft : null}
        />
      </div>
    </section>
  {:else if previewMode === 'snapshot'}
    <section class="snapshot-preview-stage">
      <PanoptesSnapshotSurface
        snapshot={previewSnapshot}
        activeTab={snapshotTab}
        {selectedCompetitorId}
        onSelectCompetitor={(competitorId) => (selectedCompetitorId = competitorId)}
        {selectedPlan}
        allStrategyTasks={selectedPlanTasks}
      />
    </section>
  {:else}
    <section class="admin-preview-stage">
      <AdminConsole />
    </section>
  {/if}
</main>

<style>
  .preview-page {
    display: grid;
    gap: 20px;
    padding: 20px 24px 36px;
  }

  .preview-header-card,
  .top-preview-stage,
  .snapshot-preview-stage,
  .admin-preview-stage {
    padding: 20px;
    border-radius: 28px;
    border: 1px solid #e8ddd3;
    background: rgba(255, 251, 247, 0.96);
    box-shadow: 0 18px 40px rgba(54, 36, 16, 0.08);
  }

  .preview-header-card {
    display: grid;
    gap: 16px;
  }

  .preview-copy {
    display: grid;
    gap: 6px;
  }

  .eyebrow,
  h1,
  .preview-copy p:last-child {
    margin: 0;
  }

  .eyebrow {
    color: #ff6200;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    color: #403631;
    font-size: clamp(28px, 2.2vw, 38px);
  }

  .preview-copy p:last-child {
    color: #7b7067;
    line-height: 1.7;
  }

  .top-preview-stage {
    padding: 0;
    overflow: hidden;
  }

  .analysis-preview-stage {
    min-height: 720px;
    padding: 32px;
    border-radius: 34px;
    background: linear-gradient(180deg, #ffb383 0%, #ff9c5a 38%, #ff8a42 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
    display: grid;
    place-items: center;
  }

  .analysis-preview-frame {
    width: min(760px, 100%);
  }

  .snapshot-preview-stage,
  .admin-preview-stage {
    overflow: auto;
  }

  @media (max-width: 960px) {
    .preview-page {
      padding-inline: 12px;
    }

    .analysis-preview-stage {
      padding: 16px;
      min-height: 560px;
    }
  }
</style>
