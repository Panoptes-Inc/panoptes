import { writable } from 'svelte/store';
import type { PanoptesStrategyUiStore } from '../types';

export const initialStrategyUiState: PanoptesStrategyUiStore = {
  selectedStrategyPlanId: null,
  selectedPhase: 'day_30',
  selectedTaskId: null,
  taskMutationStatus: 'idle',
  strategySelectionStatus: 'idle'
};

export const strategyUiStore = writable<PanoptesStrategyUiStore>(initialStrategyUiState);
