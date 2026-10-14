import type {
  PanoptesAnalysisSnapshotPayload,
  PanoptesPhaseTask,
  PanoptesProjectDetailStore,
  PanoptesStrategyUiStore,
  Uuid
} from '../types';

export function buildStrategyUiStateFromSnapshot(
  currentUi: PanoptesStrategyUiStore,
  snapshot: PanoptesAnalysisSnapshotPayload | null
): PanoptesStrategyUiStore {
  const selectedPlan =
    snapshot?.strategyPlans.find((plan) => plan.isSelected) ??
    snapshot?.strategyPlans[0] ??
    null;

  return {
    ...currentUi,
    selectedStrategyPlanId:
      selectedPlan && snapshot?.strategyPlans.some((plan) => plan.strategyPlanId === currentUi.selectedStrategyPlanId)
        ? currentUi.selectedStrategyPlanId
        : selectedPlan?.strategyPlanId ?? null,
    selectedPhase: currentUi.selectedPhase ?? 'day_30',
    selectedTaskId: null
  };
}

export function applyStrategySelectionToSnapshot(
  snapshot: PanoptesAnalysisSnapshotPayload | null,
  analysisSnapshotId: Uuid,
  selectedStrategyPlanId: Uuid
): PanoptesAnalysisSnapshotPayload | null {
  if (!snapshot || snapshot.analysisSnapshotId !== analysisSnapshotId) {
    return snapshot;
  }

  return {
    ...snapshot,
    strategyPlans: snapshot.strategyPlans.map((plan) => ({
      ...plan,
      isSelected: plan.strategyPlanId === selectedStrategyPlanId
    }))
  };
}

export function applyPhaseTaskPatchToSnapshot(
  snapshot: PanoptesAnalysisSnapshotPayload | null,
  phaseTask: PanoptesPhaseTask
): PanoptesAnalysisSnapshotPayload | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    phaseTasks: snapshot.phaseTasks.map((task) => (task.phaseTaskId === phaseTask.phaseTaskId ? phaseTask : task))
  };
}

export function buildProjectDetailWithSelectedStrategy(
  currentDetail: PanoptesProjectDetailStore,
  input: {
    analysisSnapshotId: Uuid;
    selectedStrategyPlanId: Uuid;
    selectedStrategyKey: string;
  }
): PanoptesProjectDetailStore {
  return {
    ...currentDetail,
    project: currentDetail.project
      ? {
          ...currentDetail.project,
          currentStrategyPlanId: input.selectedStrategyPlanId,
          selectedStrategyKey: input.selectedStrategyKey
        }
      : currentDetail.project,
    currentSnapshot: applyStrategySelectionToSnapshot(
      currentDetail.currentSnapshot,
      input.analysisSnapshotId,
      input.selectedStrategyPlanId
    ),
    lastStableSnapshot: applyStrategySelectionToSnapshot(
      currentDetail.lastStableSnapshot,
      input.analysisSnapshotId,
      input.selectedStrategyPlanId
    )
  };
}

export function buildProjectDetailWithPatchedPhaseTask(
  currentDetail: PanoptesProjectDetailStore,
  phaseTask: PanoptesPhaseTask
): PanoptesProjectDetailStore {
  return {
    ...currentDetail,
    currentSnapshot: applyPhaseTaskPatchToSnapshot(currentDetail.currentSnapshot, phaseTask),
    lastStableSnapshot: applyPhaseTaskPatchToSnapshot(currentDetail.lastStableSnapshot, phaseTask)
  };
}
