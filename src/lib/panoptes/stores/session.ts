import { writable } from 'svelte/store';
import type { PanoptesSessionUiStore } from '../types';

export const initialSessionUiState: PanoptesSessionUiStore = {
  selectedProjectId: null,
  lastStableSelectedProjectId: null,
  createFlowOpen: false,
  createFlowStatus: 'idle',
  projectSwitchStatus: 'idle',
  rightPanelMode: 'project_list',
  mainSurfaceMode: 'dashboard',
  globalBlockingAction: null,
  pendingNavigationIntent: null
};

export const sessionUiStore = writable<PanoptesSessionUiStore>(initialSessionUiState);
