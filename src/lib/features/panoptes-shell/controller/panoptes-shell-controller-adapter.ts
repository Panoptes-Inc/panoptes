import { get } from 'svelte/store';
import {
	confirmInference,
	createAndStartAnalysis,
	reanalyzeCurrentProject,
	stopPolling,
	syncActivePolling,
	updateInferenceDraft
} from '$lib/panoptes/actions/analysis';
import { attachNetworkListeners } from '$lib/panoptes/actions/network';
import {
	bootstrapPanoptesShell,
	closeCreateFlow,
	openCreateFlow,
	reconcileActiveSelectionAfterReconnect,
	selectProject
} from '$lib/panoptes/actions/projects';
import {
	selectStrategyPhase,
	selectStrategyPlan,
	selectStrategyTask,
	syncStrategyUiFromSnapshot,
	updateStrategyTaskStatus
} from '$lib/panoptes/actions/strategy';
import { projectCollectionStore, projectDetailStore } from '$lib/panoptes/stores/projects';
import type { PanoptesAnalysisSnapshotPayload } from '$lib/panoptes/types';
import { loadOrganizationBoundary } from '$lib/features/organization/organization-boundary';
import { organizationBoundaryClient } from '$lib/panoptes/api/organization-boundary-client';
import {
	createPanoptesShellController,
	type PanoptesShellControllerDependencies
} from './panoptes-shell-controller';

const dependencies: PanoptesShellControllerDependencies = {
	validateOrganization: async ({ organizationId, signal }) => {
		await loadOrganizationBoundary({ organizationId, signal }, organizationBoundaryClient);
	},
	hasHydratedState: () =>
		get(projectCollectionStore).items.length > 0 && Boolean(get(projectDetailStore).projectId),
	hasCurrentProject: () => Boolean(get(projectDetailStore).project),
	getLastStableSnapshot: () => get(projectDetailStore).lastStableSnapshot,
	bootstrap: async (afterHydrate) => bootstrapPanoptesShell(afterHydrate),
	syncPolling: syncActivePolling,
	stopPolling,
	attachNetwork: attachNetworkListeners,
	reconcileAfterReconnect: async (afterHydrate) =>
		reconcileActiveSelectionAfterReconnect(afterHydrate),
	createAnalysis: createAndStartAnalysis,
	reanalyze: reanalyzeCurrentProject,
	confirm: confirmInference,
	selectProject,
	selectStrategy: selectStrategyPlan,
	updateTaskStatus: updateStrategyTaskStatus,
	openCreateFlow,
	closeCreateFlow,
	updateInferenceDraft,
	selectPhase: selectStrategyPhase,
	selectTask: selectStrategyTask,
	syncStrategy: syncStrategyUiFromSnapshot
};

export function createDefaultPanoptesShellController(
	getFallbackSnapshot: () => PanoptesAnalysisSnapshotPayload | null,
	getOrganizationId: () => string | null
) {
	return createPanoptesShellController(getFallbackSnapshot, getOrganizationId, dependencies);
}
