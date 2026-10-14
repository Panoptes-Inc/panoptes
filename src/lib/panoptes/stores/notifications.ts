import { writable } from 'svelte/store';
import type { PanoptesNotificationStore } from '../types';

export const initialNotificationState: PanoptesNotificationStore = {
  toasts: []
};

export const notificationStore = writable<PanoptesNotificationStore>(initialNotificationState);
