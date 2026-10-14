import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { panoptesApiClient } from '../api/client';
import {
  buildProjectCollectionWithPatch,
  buildProjectCollectionWithUpsert,
  buildProjectDetailStoreFromResponse,
  buildRuntimeStoreForNewJob,
  buildRuntimeStoreFromProjectDetail
} from '../domain/project-sync';
import { projectCollectionStore, projectDetailStore } from '../stores/projects';
import { analysisRuntimeStore, initialAnalysisRuntimeState } from '../stores/runtime';
import { sessionUiStore } from '../stores/session';
import type { PanoptesAnalysisJob, PanoptesProjectDetailView, PanoptesProjectSummary, Uuid } from '../types';
import { pushToast } from './network';

const SELECTED_PROJECT_STORAGE_KEY = 'panoptes.selected_project_id';

function persistSelectedProjectId(projectId: Uuid | null): void {
  if (!browser) return;
  if (projectId) {
    window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, projectId);
  } else {
    window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY);
  }
}

function readPersistedSelectedProjectId(): Uuid | null {
  if (!browser) return null;
  return window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY);
}

export function upsertProjectSummary(summary: PanoptesProjectSummary): void {
  projectCollectionStore.update((store) => buildProjectCollectionWithUpsert(store, summary));
}

export function mergeProjectSummaryPatch(projectId: Uuid, patch: Partial<PanoptesProjectSummary>): void {
  projectCollectionStore.update((store) => buildProjectCollectionWithPatch(store, projectId, patch));
}

export function setProjectDetailFromResponse(detail: PanoptesProjectDetailView): void {
  const current = get(projectDetailStore);
  projectDetailStore.set(buildProjectDetailStoreFromResponse(current, detail));
}

export function syncRuntimeWithProjectDetail(detail: PanoptesProjectDetailView): void {
  const currentRuntime = get(analysisRuntimeStore);
  analysisRuntimeStore.set(buildRuntimeStoreFromProjectDetail(currentRuntime, detail, initialAnalysisRuntimeState));
}

export function resetRuntimeForNewJob(projectId: Uuid, job: PanoptesAnalysisJob): void {
  analysisRuntimeStore.set(buildRuntimeStoreForNewJob(projectId, job, initialAnalysisRuntimeState));
}

export async function refreshProjectList(mode: 'loading' | 'refreshing' = 'refreshing'): Promise<PanoptesProjectSummary[]> {
  projectCollectionStore.update((store) => ({
    ...store,
    fetchStatus: store.items.length === 0 ? 'loading' : mode
  }));

  try {
    const response = await panoptesApiClient.listProjects();
    projectCollectionStore.set({
      items: response.items,
      fetchStatus: 'idle',
      fetchedAt: new Date().toISOString()
    });
    return response.items;
  } catch (error) {
    projectCollectionStore.update((store) => ({
      ...store,
      fetchStatus: 'failed'
    }));
    pushToast('error', 'プロジェクト一覧の取得に失敗しました。');
    throw error;
  }
}

export async function selectProject(projectId: Uuid): Promise<PanoptesProjectDetailView | null> {
  const previousSession = get(sessionUiStore);
  const previousDetail = get(projectDetailStore);
  const previousRuntime = get(analysisRuntimeStore);

  sessionUiStore.update((store) => ({
    ...store,
    projectSwitchStatus: 'switching',
    pendingNavigationIntent: { type: 'select_project', projectId },
    globalBlockingAction: 'switching_project'
  }));
  projectDetailStore.update((store) => ({
    ...store,
    hydrationStatus: 'loading'
  }));

  try {
    const detail = await panoptesApiClient.getProjectDetail(projectId);
    setProjectDetailFromResponse(detail);
    syncRuntimeWithProjectDetail(detail);
    upsertProjectSummary(detail.projectSummary);

    sessionUiStore.update((store) => ({
      ...store,
      selectedProjectId: projectId,
      lastStableSelectedProjectId: projectId,
      projectSwitchStatus: 'idle',
      pendingNavigationIntent: null,
      globalBlockingAction: null
    }));
    persistSelectedProjectId(projectId);
    return detail;
  } catch (error) {
    projectDetailStore.set(previousDetail);
    analysisRuntimeStore.set(previousRuntime);
    sessionUiStore.update((store) => ({
      ...store,
      selectedProjectId: previousSession.lastStableSelectedProjectId ?? previousSession.selectedProjectId,
      projectSwitchStatus: 'failed',
      pendingNavigationIntent: null,
      globalBlockingAction: null
    }));
    pushToast('error', 'プロジェクトの読み込みに失敗しました。前の表示を維持します。');
    return null;
  }
}

export function openCreateFlow(): void {
  sessionUiStore.update((store) => ({
    ...store,
    createFlowOpen: true,
    createFlowStatus: 'editing'
  }));
}

export function closeCreateFlow(): void {
  sessionUiStore.update((store) => ({
    ...store,
    createFlowOpen: false,
    createFlowStatus: 'idle'
  }));
}

export async function bootstrapPanoptesShell(afterHydrate: () => Promise<void> | void = () => undefined): Promise<void> {
  const items = await refreshProjectList('loading');
  const currentSession = get(sessionUiStore);
  const preferredProjectId =
    currentSession.selectedProjectId ??
    readPersistedSelectedProjectId() ??
    items[0]?.projectId ??
    null;

  if (!preferredProjectId) return;

  const detail = await selectProject(preferredProjectId);
  if (detail) {
    await afterHydrate();
  }
}

export async function reconcileActiveSelectionAfterReconnect(
  afterHydrate: () => Promise<void> | void = () => undefined
): Promise<void> {
  const selectedProjectId = get(sessionUiStore).selectedProjectId ?? readPersistedSelectedProjectId();
  if (!selectedProjectId) return;

  const detail = await selectProject(selectedProjectId);
  if (detail) {
    await afterHydrate();
  }
}
