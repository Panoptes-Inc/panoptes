import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAnalysisPollingController } from '../../src/lib/panoptes/polling/analysis-polling-controller';

type TestResult = { status: 'active' | 'completed' | 'failed' | 'cancelled' };

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

function createHarness(input?: {
	request?: () => Promise<TestResult>;
	canPoll?: () => boolean;
	isOnline?: () => boolean;
}) {
	const request = vi.fn(input?.request ?? (async () => ({ status: 'active' as const })));
	const handleResult = vi.fn((result: TestResult) =>
		result.status === 'active' ? ('continue' as const) : ('stop' as const)
	);
	const handleError = vi.fn(() => 'continue' as const);
	const handleTimeout = vi.fn(() => 'continue' as const);
	const onScheduled = vi.fn();
	const onStopped = vi.fn();
	const controller = createAnalysisPollingController({
		canPoll: input?.canPoll ?? (() => true),
		isOnline: input?.isOnline ?? (() => true),
		getDelayMs: () => 2500,
		request,
		handleResult,
		handleError,
		handleTimeout,
		onScheduled,
		onStopped,
		requestTimeoutMs: 1000
	});

	return { controller, request, handleResult, handleError, handleTimeout, onScheduled, onStopped };
}

afterEach(() => {
	vi.useRealTimers();
});

describe('analysis polling controller', () => {
	it('starts immediately and schedules the next poll while the job remains active', async () => {
		vi.useFakeTimers();
		const harness = createHarness();

		await harness.controller.sync();

		expect(harness.request).toHaveBeenCalledTimes(1);
		expect(harness.onScheduled).toHaveBeenCalledWith(2500);
	});

	it.each(['completed', 'failed', 'cancelled'] as const)(
		'stops when the polling result is %s',
		async (status) => {
			vi.useFakeTimers();
			const harness = createHarness({ request: async () => ({ status }) });

			await harness.controller.runNow();

			expect(harness.onStopped).toHaveBeenCalledTimes(1);
			expect(harness.onScheduled).not.toHaveBeenCalled();
		}
	);

	it('prevents overlapping requests', async () => {
		vi.useFakeTimers();
		const pending = deferred<TestResult>();
		const harness = createHarness({ request: () => pending.promise });

		const first = harness.controller.runNow();
		const second = harness.controller.runNow();
		expect(harness.request).toHaveBeenCalledTimes(1);

		pending.resolve({ status: 'active' });
		await Promise.all([first, second]);
		expect(harness.handleResult).toHaveBeenCalledTimes(1);
	});

	it('backs off after a request timeout and ignores the late result', async () => {
		vi.useFakeTimers();
		const pending = deferred<TestResult>();
		const harness = createHarness({ request: () => pending.promise });

		const poll = harness.controller.runNow();
		await vi.advanceTimersByTimeAsync(1000);
		await poll;

		expect(harness.handleTimeout).toHaveBeenCalledTimes(1);
		expect(harness.onScheduled).toHaveBeenCalledWith(2500);
		pending.resolve({ status: 'completed' });
		await Promise.resolve();
		expect(harness.handleResult).not.toHaveBeenCalled();
	});

	it('does not request while offline and schedules a retry', async () => {
		vi.useFakeTimers();
		const harness = createHarness({ isOnline: () => false });

		await harness.controller.sync();

		expect(harness.request).not.toHaveBeenCalled();
		expect(harness.onScheduled).toHaveBeenCalledWith(2500);
	});

	it('ignores a stale result after polling is stopped', async () => {
		vi.useFakeTimers();
		const pending = deferred<TestResult>();
		const harness = createHarness({ request: () => pending.promise });

		const poll = harness.controller.runNow();
		harness.controller.stop();
		pending.resolve({ status: 'completed' });
		await poll;

		expect(harness.handleResult).not.toHaveBeenCalled();
	});

	it('clears scheduled work during destroy cleanup', async () => {
		vi.useFakeTimers();
		const harness = createHarness();
		await harness.controller.sync();
		harness.controller.destroy();

		await vi.advanceTimersByTimeAsync(3000);

		expect(harness.request).toHaveBeenCalledTimes(1);
		expect(harness.onStopped).toHaveBeenCalled();
	});
});
