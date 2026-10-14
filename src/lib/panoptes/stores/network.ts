import { writable } from 'svelte/store';
import type { PanoptesNetworkStore } from '../types';

export const initialNetworkState: PanoptesNetworkStore = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  apiReachability: 'unknown',
  lastCheckedAt: null
};

export const networkStore = writable<PanoptesNetworkStore>(initialNetworkState);
