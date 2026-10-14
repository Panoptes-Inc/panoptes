import { writable } from 'svelte/store';
import type { PanoptesAnalysisRuntimeStore } from '../types';

export const initialAnalysisRuntimeState: PanoptesAnalysisRuntimeStore = {
  activeProjectId: null,
  activeJobId: null,
  activeAnalysisSessionId: null,
  runtimeStatus: 'idle',
  visibleStep: null,
  visibleStepIndex: null,
  serverConfirmedPhase: null,
  serverConfirmedStepIndex: null,
  progressPercent: null,
  statusMessage: null,
  inferenceDraft: null,
  canConfirmInference: false,
  confirmMutationStatus: 'idle',
  pollingStatus: 'stopped',
  pollingIntervalMs: null,
  lastProgressEventAt: null,
  terminalReason: null
};

export const analysisRuntimeStore = writable<PanoptesAnalysisRuntimeStore>(initialAnalysisRuntimeState);
