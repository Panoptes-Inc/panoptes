import type {
	PanoptesAnalysisSnapshotPayload,
	PanoptesCreateAnalysisResult,
	PanoptesInferenceDraft,
	PanoptesPhaseTaskStatus,
	PanoptesProjectDetailView,
	PanoptesStrategyPhase
} from '$lib/panoptes/types';

export type PanoptesShellBootstrapStatus = 'idle' | 'loading' | 'ready' | 'failed';

export type PanoptesShellControllerDependencies = {
	validateOrganization: (input: {
		organizationId: string | null;
		signal: AbortSignal;
	}) => Promise<void>;
	hasHydratedState: () => boolean;
	hasCurrentProject: () => boolean;
	getLastStableSnapshot: () => PanoptesAnalysisSnapshotPayload | null;
	bootstrap: (afterHydrate: () => Promise<void>) => Promise<void>;
	syncPolling: () => Promise<void>;
	stopPolling: () => void;
	attachNetwork: (onReconnect: () => Promise<void>) => () => void;
	reconcileAfterReconnect: (afterHydrate: () => Promise<void>) => Promise<void>;
	createAnalysis: (input: {
		targetUrl: string;
		projectName?: string;
	}) => Promise<PanoptesCreateAnalysisResult | null>;
	reanalyze: () => Promise<boolean>;
	confirm: () => Promise<boolean>;
	selectProject: (projectId: string) => Promise<PanoptesProjectDetailView | null>;
	selectStrategy: (strategyKey: string) => Promise<boolean>;
	updateTaskStatus: (taskId: string, status: PanoptesPhaseTaskStatus) => Promise<boolean>;
	openCreateFlow: () => void;
	closeCreateFlow: () => void;
	updateInferenceDraft: (patch: Partial<PanoptesInferenceDraft>) => void;
	selectPhase: (phase: PanoptesStrategyPhase) => void;
	selectTask: (taskId: string | null) => void;
	syncStrategy: (snapshot: PanoptesAnalysisSnapshotPayload | null) => void;
};

export function createPanoptesShellController(
	getFallbackSnapshot: () => PanoptesAnalysisSnapshotPayload | null,
	getOrganizationId: () => string | null,
	dependencies: PanoptesShellControllerDependencies
) {
	let bootstrapStatus: PanoptesShellBootstrapStatus = 'idle';
	let startPromise: Promise<void> | null = null;
	let detachNetwork: (() => void) | null = null;
	let destroyed = false;
	let lifecycleController: AbortController | null = null;

	function start(): Promise<void> {
		if (destroyed || bootstrapStatus === 'ready') return Promise.resolve();
		if (startPromise) return startPromise;

		bootstrapStatus = 'loading';
		lifecycleController = new AbortController();
		const task = dependencies
			.validateOrganization({
				organizationId: getOrganizationId(),
				signal: lifecycleController.signal
			})
			.then(() =>
				dependencies.hasHydratedState()
					? dependencies.syncPolling()
					: dependencies.bootstrap(dependencies.syncPolling)
			)
			.then(() => {
				if (!destroyed) bootstrapStatus = 'ready';
			})
			.catch(() => {
				if (!destroyed) bootstrapStatus = 'failed';
			})
			.finally(() => {
				if (startPromise === task) startPromise = null;
			});

		startPromise = task;
		return task;
	}

	function mount(): () => void {
		if (!detachNetwork) {
			detachNetwork = dependencies.attachNetwork(async () => {
				if (destroyed) return;
				await dependencies.reconcileAfterReconnect(dependencies.syncPolling);
			});
		}
		void start();

		return () => {
			destroyed = true;
			lifecycleController?.abort();
			lifecycleController = null;
			detachNetwork?.();
			detachNetwork = null;
			dependencies.stopPolling();
		};
	}

	async function retryBootstrap(): Promise<void> {
		if (bootstrapStatus !== 'failed') return;
		bootstrapStatus = 'idle';
		await start();
	}

	async function createProject(input: { targetUrl: string; projectName?: string }): Promise<boolean> {
		return Boolean(await dependencies.createAnalysis(input));
	}

	async function retryAnalysis(): Promise<void> {
		if (dependencies.hasCurrentProject()) {
			await dependencies.reanalyze();
			return;
		}
		dependencies.openCreateFlow();
	}

	async function chooseProject(projectId: string): Promise<void> {
		const detail = await dependencies.selectProject(projectId);
		if (!detail) return;

		dependencies.syncStrategy(
			detail.currentSnapshot ?? dependencies.getLastStableSnapshot() ?? getFallbackSnapshot()
		);
		await dependencies.syncPolling();
	}

	return {
		mount,
		start,
		retryBootstrap,
		createProject,
		retryAnalysis,
		confirmInference: dependencies.confirm,
		selectProject: chooseProject,
		selectStrategy: dependencies.selectStrategy,
		updateTaskStatus: (taskId: string, status: PanoptesPhaseTaskStatus) =>
			dependencies.updateTaskStatus(taskId, status),
		openCreateFlow: dependencies.openCreateFlow,
		closeCreateFlow: dependencies.closeCreateFlow,
		updateInferenceDraft: dependencies.updateInferenceDraft,
		selectPhase: dependencies.selectPhase,
		selectTask: dependencies.selectTask,
		syncSnapshot: dependencies.syncStrategy,
		getBootstrapStatus: () => bootstrapStatus
	};
}
