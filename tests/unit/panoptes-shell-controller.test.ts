import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PanoptesShellControllerDependencies } from '../../src/lib/features/panoptes-shell/controller/panoptes-shell-controller';
import { createPanoptesShellController } from '../../src/lib/features/panoptes-shell/controller/panoptes-shell-controller';
import {
	resolveSelectedCompetitorId,
	selectStrategyTasks
} from '../../src/lib/features/panoptes-shell/mapping/shell-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';
import {
	initialProjectDetailState,
	projectDetailStore
} from '../../src/lib/panoptes/stores/projects';

function createDependencies(
	overrides: Partial<PanoptesShellControllerDependencies> = {}
): PanoptesShellControllerDependencies {
	return {
		validateOrganization: vi.fn(async () => undefined),
		hasHydratedState: () => false,
		hasCurrentProject: () => false,
		getLastStableSnapshot: () => null,
		bootstrap: vi.fn(async (afterHydrate) => afterHydrate()),
		syncPolling: vi.fn(async () => undefined),
		stopPolling: vi.fn(),
		attachNetwork: vi.fn(() => vi.fn()),
		reconcileAfterReconnect: vi.fn(async (afterHydrate) => afterHydrate()),
		createAnalysis: vi.fn(async () => null),
		reanalyze: vi.fn(async () => false),
		confirm: vi.fn(async () => false),
		selectProject: vi.fn(async () => null),
		selectStrategy: vi.fn(async () => false),
		updateTaskStatus: vi.fn(async () => false),
		openCreateFlow: vi.fn(),
		closeCreateFlow: vi.fn(),
		updateInferenceDraft: vi.fn(),
		selectPhase: vi.fn(),
		selectTask: vi.fn(),
		syncStrategy: vi.fn(),
		...overrides
	};
}

beforeEach(() => {
	projectDetailStore.set(initialProjectDetailState);
});

describe('Panoptes shell controller bootstrap', () => {
	it('completes bootstrap success and starts polling after hydration', async () => {
		const dependencies = createDependencies();
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await controller.start();

		expect(dependencies.bootstrap).toHaveBeenCalledTimes(1);
		expect(dependencies.syncPolling).toHaveBeenCalledTimes(1);
		expect(controller.getBootstrapStatus()).toBe('ready');
	});

	it('keeps a partial bootstrap without a selected project renderable', async () => {
		const dependencies = createDependencies({
			bootstrap: vi.fn(async () => undefined)
		});
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await controller.start();

		expect(dependencies.syncPolling).not.toHaveBeenCalled();
		expect(controller.getBootstrapStatus()).toBe('ready');
	});

	it('maps total bootstrap failure to controller state without rejecting mount work', async () => {
		const dependencies = createDependencies({
			bootstrap: vi.fn(async () => {
				throw new Error('unavailable');
			})
		});
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await expect(controller.start()).resolves.toBeUndefined();
		expect(controller.getBootstrapStatus()).toBe('failed');
	});

	it('prevents duplicate bootstrap starts', async () => {
		let finish!: () => void;
		const pending = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const dependencies = createDependencies({ bootstrap: vi.fn(() => pending) });
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		const first = controller.start();
		const second = controller.start();
		await Promise.resolve();
		expect(dependencies.bootstrap).toHaveBeenCalledTimes(1);

		finish();
		await Promise.all([first, second]);
	});

	it('retries a failed bootstrap explicitly', async () => {
		const bootstrap = vi
			.fn<PanoptesShellControllerDependencies['bootstrap']>()
			.mockRejectedValueOnce(new Error('unavailable'))
			.mockResolvedValueOnce(undefined);
		const dependencies = createDependencies({ bootstrap });
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await controller.start();
		await controller.retryBootstrap();

		expect(bootstrap).toHaveBeenCalledTimes(2);
		expect(controller.getBootstrapStatus()).toBe('ready');
	});

	it('cleans up network listeners and polling on destroy', () => {
		const detach = vi.fn();
		const dependencies = createDependencies({ attachNetwork: vi.fn(() => detach) });
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		const destroy = controller.mount();
		destroy();

		expect(detach).toHaveBeenCalledTimes(1);
		expect(dependencies.stopPolling).toHaveBeenCalledTimes(1);
	});

	it('validates the explicit organization before bootstrap and aborts it on destroy', async () => {
		let observedSignal: AbortSignal | undefined;
		const validateOrganization = vi.fn(({ signal }: { signal: AbortSignal }) => {
			observedSignal = signal;
			return new Promise<void>(() => undefined);
		});
		const dependencies = createDependencies({ validateOrganization });
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		const destroy = controller.mount();
		expect(validateOrganization).toHaveBeenCalledWith({
			organizationId: 'org-1',
			signal: expect.any(AbortSignal)
		});
		expect(dependencies.bootstrap).not.toHaveBeenCalled();

		destroy();
		expect(observedSignal?.aborted).toBe(true);
	});
});

describe('Panoptes shell view state mapping', () => {
	it('preserves a valid competitor selection and replaces a stale selection', () => {
		const firstId = dummySnapshot.competitors.cards[0]!.competitorId;
		expect(resolveSelectedCompetitorId(dummySnapshot, firstId)).toBe(firstId);
		expect(resolveSelectedCompetitorId(dummySnapshot, 'stale-id')).toBe(firstId);
	});

	it('maps phase tasks only for the selected strategy plan', () => {
		const selectedPlan = dummySnapshot.strategyPlans[0]!;
		const tasks = selectStrategyTasks(dummySnapshot, selectedPlan);

		expect(tasks.length).toBeGreaterThan(0);
		expect(tasks.every((task) => task.strategyPlanId === selectedPlan.strategyPlanId)).toBe(true);
	});

	it('reflects create action success without owning draft UI state', async () => {
		const dependencies = createDependencies({
			createAnalysis: vi.fn(async () => ({}) as never)
		});
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await expect(controller.createProject({ targetUrl: 'https://example.com' })).resolves.toBe(
			true
		);
	});

	it('dispatches retry to reanalysis when a project is selected', async () => {
		const dependencies = createDependencies({ hasCurrentProject: () => true });
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await controller.retryAnalysis();

		expect(dependencies.reanalyze).toHaveBeenCalledTimes(1);
		expect(dependencies.openCreateFlow).not.toHaveBeenCalled();
	});

	it('opens create flow when retry has no selected project', async () => {
		const dependencies = createDependencies();
		const controller = createPanoptesShellController(
			() => dummySnapshot,
			() => 'org-1',
			dependencies
		);

		await controller.retryAnalysis();

		expect(dependencies.reanalyze).not.toHaveBeenCalled();
		expect(dependencies.openCreateFlow).toHaveBeenCalledTimes(1);
	});
});
