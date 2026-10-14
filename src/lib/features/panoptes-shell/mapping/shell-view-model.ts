import type {
	PanoptesAnalysisRuntimeStore,
	PanoptesAnalysisSnapshotPayload,
	PanoptesProjectRecord,
	PanoptesStrategyPlan
} from '$lib/panoptes/types';

export type SnapshotTabId = 'competitor' | 'industry' | 'self' | 'strategy';

export const SNAPSHOT_TABS = [
	{ id: 'competitor', label: '競合' },
	{ id: 'industry', label: '業界' },
	{ id: 'self', label: '自社' },
	{ id: 'strategy', label: '戦略' }
] satisfies Array<{ id: SnapshotTabId; label: string }>;

export function resolveSelectedCompetitorId(
	snapshot: PanoptesAnalysisSnapshotPayload,
	currentId: string | null
): string | null {
	if (currentId && snapshot.competitors.cards.some((card) => card.competitorId === currentId)) {
		return currentId;
	}
	return snapshot.competitors.cards[0]?.competitorId ?? null;
}

export function selectStrategyTasks(
	snapshot: PanoptesAnalysisSnapshotPayload | null,
	plan: PanoptesStrategyPlan | null
) {
	if (!snapshot || !plan) return [];
	return snapshot.phaseTasks.filter((task) => task.strategyPlanId === plan.strategyPlanId);
}

export function isReanalyzeDisabled(
	project: PanoptesProjectRecord | null,
	runtime: PanoptesAnalysisRuntimeStore
): boolean {
	return (
		!project ||
		(runtime.activeProjectId === project.projectId &&
			!['idle', 'completed', 'failed'].includes(runtime.runtimeStatus))
	);
}

export function buildShellHeaderMeta(
	snapshot: PanoptesAnalysisSnapshotPayload | null,
	project: PanoptesProjectRecord | null
) {
	return {
		tokenUsageRate: snapshot?.meta.tokenUsageRate ?? 64,
		memoryLabel: snapshot?.meta.memoryLabel ?? '記憶稼働中',
		projectDayCount: snapshot?.meta.projectDayCount ?? 24,
		projectDayMax: 90,
		aiModeLabel: 'デフォルト',
		tokenModeLabel: '高負荷',
		projectStatusLabel: project?.projectStatus === 'ready' ? '保存済' : '未保存',
		analyzedDateLabel: snapshot?.meta.analyzedDateLabel ?? '----.--.--'
	};
}
