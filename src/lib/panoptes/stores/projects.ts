import { writable } from 'svelte/store';
import type { PanoptesProjectCollectionStore, PanoptesProjectDetailStore } from '../types';

export const initialProjectCollectionState: PanoptesProjectCollectionStore = {
  items: [],
  fetchStatus: 'idle',
  fetchedAt: null
};

export const initialProjectDetailState: PanoptesProjectDetailStore = {
  projectId: null,
  hydrationStatus: 'idle',
  project: null,
  currentSnapshot: null,
  lastStableSnapshot: null,
  latestAnalysisJob: null,
  derivedDisplayState: 'empty',
  error: null
};

export const projectCollectionStore = writable<PanoptesProjectCollectionStore>(initialProjectCollectionState);
export const projectDetailStore = writable<PanoptesProjectDetailStore>(initialProjectDetailState);
