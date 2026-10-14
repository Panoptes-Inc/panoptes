import { derived, type Readable } from 'svelte/store';
import { analysisRuntimeStore } from '../stores/runtime';
import { projectCollectionStore, projectDetailStore } from '../stores/projects';
import { sessionUiStore } from '../stores/session';
import { strategyUiStore } from '../stores/strategy';
import type {
  PanoptesAnalysisSnapshotPayload,
  PanoptesMainSurfaceRenderMode,
  PanoptesProjectDisplayState,
  PanoptesStrategyPhase,
  PanoptesStrategyPlan
} from '../types';
import { canRenderCommittedSnapshot, projectStatusToDisplayState, shouldPreserveStableSnapshot } from '../utils/guards';

export const selectedProjectSummary = derived(
  [sessionUiStore, projectCollectionStore],
  ([$sessionUiStore, $projectCollectionStore]) =>
    $projectCollectionStore.items.find((item) => item.projectId === $sessionUiStore.selectedProjectId) ?? null
);

export const derivedProjectDisplayState: Readable<PanoptesProjectDisplayState> = derived(
  [projectDetailStore],
  ([$projectDetailStore]) =>
    projectStatusToDisplayState({
      projectStatus: $projectDetailStore.project?.projectStatus ?? 'empty',
      currentSnapshotId: $projectDetailStore.project?.currentSnapshotId ?? null,
      latestAnalysisJobId: $projectDetailStore.project?.latestAnalysisJobId ?? null
    })
);

export const hasStableSnapshot = derived([projectDetailStore], ([$projectDetailStore]) => Boolean($projectDetailStore.lastStableSnapshot));

export const isReanalyzingOverStableSnapshot = derived(
  [projectDetailStore, analysisRuntimeStore],
  ([$projectDetailStore, $analysisRuntimeStore]) =>
    Boolean($projectDetailStore.lastStableSnapshot) &&
    Boolean($analysisRuntimeStore.activeJobId) &&
    shouldPreserveStableSnapshot($analysisRuntimeStore.runtimeStatus)
);

export const mainSurfaceRenderMode: Readable<PanoptesMainSurfaceRenderMode> = derived(
  [projectDetailStore, analysisRuntimeStore],
  ([$projectDetailStore, $analysisRuntimeStore]) => {
    const stableSnapshotExists = Boolean($projectDetailStore.lastStableSnapshot);
    const activeReanalysis =
      Boolean($analysisRuntimeStore.activeJobId) && shouldPreserveStableSnapshot($analysisRuntimeStore.runtimeStatus);

    if ($projectDetailStore.derivedDisplayState === 'ready') return 'snapshot_dashboard';
    if ($projectDetailStore.derivedDisplayState === 'failed' && stableSnapshotExists) return 'snapshot_dashboard';
    if ($projectDetailStore.derivedDisplayState === 'failed') return 'failed_state';
    if ($projectDetailStore.derivedDisplayState === 'analyzing' && stableSnapshotExists && activeReanalysis) {
      return 'snapshot_dashboard';
    }
    if ($projectDetailStore.derivedDisplayState === 'analyzing') return 'analysis_flow';
    return 'empty_state';
  }
);

export const currentRenderableSnapshot: Readable<PanoptesAnalysisSnapshotPayload | null> = derived(
  [projectDetailStore, analysisRuntimeStore],
  ([$projectDetailStore, $analysisRuntimeStore]) => {
    if (shouldPreserveStableSnapshot($analysisRuntimeStore.runtimeStatus) && $projectDetailStore.lastStableSnapshot) {
      return $projectDetailStore.lastStableSnapshot;
    }

    return $projectDetailStore.currentSnapshot ?? $projectDetailStore.lastStableSnapshot;
  }
);

export const analysisOverlayMode = derived(
  [projectDetailStore, analysisRuntimeStore],
  ([$projectDetailStore, $analysisRuntimeStore]) => {
    const readyBaseExists =
      canRenderCommittedSnapshot($projectDetailStore.project) || Boolean($projectDetailStore.lastStableSnapshot);

    if (!readyBaseExists || !$analysisRuntimeStore.activeJobId) return 'hidden' as const;
    if (!shouldPreserveStableSnapshot($analysisRuntimeStore.runtimeStatus) && $analysisRuntimeStore.runtimeStatus !== 'failed') {
      return 'hidden' as const;
    }
    if ($analysisRuntimeStore.runtimeStatus === 'failed') return 'showing_failure' as const;
    if ($analysisRuntimeStore.runtimeStatus === 'waiting_for_inference_confirmation') {
      return 'showing_waiting_confirmation' as const;
    }
    if (shouldPreserveStableSnapshot($analysisRuntimeStore.runtimeStatus)) return 'showing_progress' as const;
    return 'hidden' as const;
  }
);

export const whitePanelPresentation = derived([analysisRuntimeStore], ([$analysisRuntimeStore]) => {
  switch ($analysisRuntimeStore.visibleStep) {
    case 'target_scan':
      return {
        title: '分析対象 URL を解析中です',
        subtitle: 'サイト構造の把握と初期推論に必要なデータを取得しています。',
        showConfirmButton: false
      };
    case 'inference_review':
      return {
        title: '業界・構造タイプの推定結果を確認してください',
        subtitle: '必要であれば修正し、確定後に競合分析へ進みます。',
        showConfirmButton: true
      };
    case 'competitor_analysis':
      return {
        title: '競合を分析中です',
        subtitle: '比較導線、訴求軸、信頼補強の傾向を収集しています。',
        showConfirmButton: false
      };
    case 'industry_analysis':
      return {
        title: '業界構造を分析中です',
        subtitle: '市場タイプ、ポジション、型分布、戦略余地を統合しています。',
        showConfirmButton: false
      };
    case 'strategy_synthesis':
      return {
        title: '戦略シナリオを構築中です',
        subtitle: '競合と自社の差を 30 / 60 / 90 日プランへ落とし込んでいます。',
        showConfirmButton: false
      };
    default:
      return {
        title: '分析を準備中です',
        subtitle: '最新の分析状態を取得しています。',
        showConfirmButton: false
      };
  }
});

export const selectedSnapshotStrategyPlan: Readable<PanoptesStrategyPlan | null> = derived(
  [currentRenderableSnapshot, strategyUiStore],
  ([$currentRenderableSnapshot, $strategyUiStore]) => {
    if (!$currentRenderableSnapshot) return null;

    const byUiSelection = $currentRenderableSnapshot.strategyPlans.find(
      (plan) => plan.strategyPlanId === $strategyUiStore.selectedStrategyPlanId
    );
    if (byUiSelection) return byUiSelection;

    return (
      $currentRenderableSnapshot.strategyPlans.find((plan) => plan.isSelected) ??
      $currentRenderableSnapshot.strategyPlans[0] ??
      null
    );
  }
);

export const selectedPhaseTasks = derived(
  [currentRenderableSnapshot, selectedSnapshotStrategyPlan, strategyUiStore],
  ([$currentRenderableSnapshot, $selectedSnapshotStrategyPlan, $strategyUiStore]) => {
    if (!$currentRenderableSnapshot || !$selectedSnapshotStrategyPlan) return [];

    const selectedPhase = ($strategyUiStore.selectedPhase ?? 'day_30') as PanoptesStrategyPhase;
    return $currentRenderableSnapshot.phaseTasks
      .filter(
        (task) =>
          task.strategyPlanId === $selectedSnapshotStrategyPlan.strategyPlanId && task.phaseCode === selectedPhase
      )
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }
);

export const projectListHasAnyItems = derived(
  [projectCollectionStore],
  ([$projectCollectionStore]) => $projectCollectionStore.items.length > 0
);
