import type { PanoptesPhaseTaskStatus } from '$lib/panoptes/types';

export const ROADMAP_TASK_STATUS_ACTIONS = [
	'todo',
	'in_progress',
	'done',
	'blocked'
] as const satisfies readonly PanoptesPhaseTaskStatus[];

export function roadmapTaskStatusLabel(status: PanoptesPhaseTaskStatus): string {
	switch (status) {
		case 'done':
			return '実施済';
		case 'in_progress':
			return '実施中';
		case 'blocked':
			return '保留';
		case 'cancelled':
			return '停止';
		case 'todo':
		default:
			return '未着手';
	}
}

export function roadmapStatusActionLabel(status: PanoptesPhaseTaskStatus): string {
	switch (status) {
		case 'done':
			return '完了';
		case 'in_progress':
			return '進行中';
		case 'blocked':
			return '保留';
		case 'cancelled':
			return '停止';
		case 'todo':
		default:
			return '未着手';
	}
}

export function roadmapTaskStatusTone(status: PanoptesPhaseTaskStatus): string {
	switch (status) {
		case 'done':
			return '#ff7a22';
		case 'in_progress':
			return '#8a81ff';
		case 'blocked':
			return '#c6bfff';
		case 'cancelled':
			return '#ddd2c8';
		case 'todo':
		default:
			return '#bdb3aa';
	}
}

export function nextChecklistTaskStatus(
	status: PanoptesPhaseTaskStatus
): PanoptesPhaseTaskStatus {
	return status === 'done' ? 'todo' : 'done';
}
