import { get } from 'svelte/store';
import { panoptesApiClient } from '../api/client';
import {
  buildProjectDetailWithPatchedPhaseTask,
  buildProjectDetailWithSelectedStrategy,
  buildStrategyUiStateFromSnapshot
} from '../domain/strategy-snapshot';
import { projectDetailStore } from '../stores/projects';
import { strategyUiStore } from '../stores/strategy';
import type {
  PanoptesAnalysisSnapshotPayload,
  PanoptesPhaseTaskStatus,
  PanoptesStrategyPhase,
  Uuid
} from '../types';
import { normalizePanoptesError } from '../utils/errors';
import { mergeProjectSummaryPatch } from './projects';
import { pushToast } from './network';

export function syncStrategyUiFromSnapshot(snapshot: PanoptesAnalysisSnapshotPayload | null): void {
  strategyUiStore.update((store) => buildStrategyUiStateFromSnapshot(store, snapshot));
}

export function selectStrategyPhase(phase: PanoptesStrategyPhase): void {
  strategyUiStore.update((store) => ({
    ...store,
    selectedPhase: phase,
    selectedTaskId: null
  }));
}

export function selectStrategyTask(taskId: Uuid | null): void {
  strategyUiStore.update((store) => ({
    ...store,
    selectedTaskId: taskId
  }));
}

export async function selectStrategyPlan(strategyKey: string): Promise<boolean> {
  const detail = get(projectDetailStore);
  const snapshot = detail.currentSnapshot ?? detail.lastStableSnapshot;
  const project = detail.project;
  if (!project || !snapshot) return false;

  strategyUiStore.update((store) => ({
    ...store,
    strategySelectionStatus: 'saving'
  }));

  try {
    const response = await panoptesApiClient.selectStrategy({
      projectId: project.projectId,
      analysisSnapshotId: snapshot.analysisSnapshotId,
      strategyKey
    });

    projectDetailStore.update((store) =>
      buildProjectDetailWithSelectedStrategy(store, {
        analysisSnapshotId: snapshot.analysisSnapshotId,
        selectedStrategyPlanId: response.selectedStrategyPlan.strategyPlanId,
        selectedStrategyKey: response.selectedStrategyPlan.strategyKey
      })
    );

    mergeProjectSummaryPatch(project.projectId, response.projectSummary);
    strategyUiStore.update((store) => ({
      ...store,
      selectedStrategyPlanId: response.selectedStrategyPlan.strategyPlanId,
      strategySelectionStatus: 'idle',
      selectedTaskId: null
    }));
    pushToast('success', '戦略プランを更新しました。');
    return true;
  } catch (error) {
    const normalized = normalizePanoptesError(error);
    strategyUiStore.update((store) => ({
      ...store,
      strategySelectionStatus: 'failed'
    }));
    pushToast('error', normalized.message);
    return false;
  }
}

export async function updateStrategyTaskStatus(phaseTaskId: Uuid, toStatus: PanoptesPhaseTaskStatus): Promise<boolean> {
  strategyUiStore.update((store) => ({
    ...store,
    taskMutationStatus: 'saving'
  }));

  try {
    const response = await panoptesApiClient.updateTaskStatus({
      phaseTaskId,
      toStatus,
      reason: null
    });

    projectDetailStore.update((store) => buildProjectDetailWithPatchedPhaseTask(store, response.phaseTask));

    strategyUiStore.update((store) => ({
      ...store,
      taskMutationStatus: 'idle',
      selectedTaskId: response.phaseTask.phaseTaskId
    }));
    pushToast('success', 'タスク状態を更新しました。');
    return true;
  } catch (error) {
    const normalized = normalizePanoptesError(error);
    strategyUiStore.update((store) => ({
      ...store,
      taskMutationStatus: 'failed'
    }));
    pushToast('error', normalized.message);
    return false;
  }
}
