import { networkStore } from '../stores/network';
import { notificationStore } from '../stores/notifications';
import type { PanoptesToastLevel, Uuid } from '../types';

function nowIso(): string {
  return new Date().toISOString();
}

function createToastId(): Uuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `toast_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function pushToast(level: PanoptesToastLevel, message: string): Uuid {
  const id = createToastId();
  notificationStore.update((store) => ({
    ...store,
    toasts: [
      ...store.toasts,
      {
        id,
        level,
        message,
        createdAt: nowIso()
      }
    ]
  }));
  return id;
}

export function removeToast(id: Uuid): void {
  notificationStore.update((store) => ({
    ...store,
    toasts: store.toasts.filter((toast) => toast.id !== id)
  }));
}

export function markNetworkOnline(): void {
  networkStore.update((store) => ({
    ...store,
    online: true,
    apiReachability: store.apiReachability === 'unreachable' ? 'degraded' : store.apiReachability,
    lastCheckedAt: nowIso()
  }));
}

export function markNetworkOffline(): void {
  networkStore.update((store) => ({
    ...store,
    online: false,
    apiReachability: 'degraded',
    lastCheckedAt: nowIso()
  }));
}

export function attachNetworkListeners(onReconnect: () => void | Promise<void> = () => undefined): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleOnline = () => {
    markNetworkOnline();
    void onReconnect();
  };
  const handleOffline = () => {
    markNetworkOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
