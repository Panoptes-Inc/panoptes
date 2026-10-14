import type { Uuid } from '../types';

function createUuid(): Uuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `panoptes_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function generateIdempotencyKey(prefix = 'panoptes'): string {
  return `${prefix}_${createUuid()}`;
}

export function createClientCorrelationId(prefix = 'ui'): string {
  return `${prefix}_${createUuid()}`;
}
