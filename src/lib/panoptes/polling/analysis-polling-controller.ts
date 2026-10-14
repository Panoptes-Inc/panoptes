export type AnalysisPollingDecision = 'continue' | 'stop';

type PollingTimer = ReturnType<typeof setTimeout>;

export type AnalysisPollingControllerDependencies<TResult> = {
	canPoll: () => boolean;
	isOnline: () => boolean;
	getDelayMs: () => number;
	request: () => Promise<TResult>;
	handleResult: (result: TResult) => Promise<AnalysisPollingDecision> | AnalysisPollingDecision;
	handleError: (error: unknown) => AnalysisPollingDecision;
	handleTimeout: () => AnalysisPollingDecision;
	onScheduled: (delayMs: number) => void;
	onStopped: () => void;
	requestTimeoutMs?: number;
	setTimer?: (callback: () => void, delayMs: number) => PollingTimer;
	clearTimer?: (timer: PollingTimer) => void;
};

export type AnalysisPollingController = {
	sync: () => Promise<void>;
	runNow: () => Promise<void>;
	schedule: () => void;
	stop: () => void;
	destroy: () => void;
	isRequestInFlight: () => boolean;
};

type PollRaceResult<TResult> =
	| { kind: 'result'; value: TResult }
	| { kind: 'error'; error: unknown }
	| { kind: 'timeout' };

export function createAnalysisPollingController<TResult>(
	dependencies: AnalysisPollingControllerDependencies<TResult>
): AnalysisPollingController {
	const setTimer = dependencies.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
	const clearTimer = dependencies.clearTimer ?? ((timer) => clearTimeout(timer));
	const requestTimeoutMs = dependencies.requestTimeoutMs ?? 30_000;

	let pollTimer: PollingTimer | null = null;
	let inFlight: Promise<void> | null = null;
	let generation = 0;
	let destroyed = false;

	function clearScheduledPoll(): void {
		if (pollTimer === null) return;
		clearTimer(pollTimer);
		pollTimer = null;
	}

	function stop(): void {
		generation += 1;
		clearScheduledPoll();
		dependencies.onStopped();
	}

	function schedule(): void {
		clearScheduledPoll();
		if (destroyed || !dependencies.canPoll()) {
			stop();
			return;
		}

		const delayMs = dependencies.getDelayMs();
		dependencies.onScheduled(delayMs);
		pollTimer = setTimer(() => {
			pollTimer = null;
			void runNow();
		}, delayMs);
	}

	function runNow(): Promise<void> {
		if (destroyed || !dependencies.canPoll()) {
			stop();
			return Promise.resolve();
		}
		if (inFlight) return inFlight;
		if (!dependencies.isOnline()) {
			schedule();
			return Promise.resolve();
		}

		clearScheduledPoll();
		const requestGeneration = generation;
		let timeoutTimer: PollingTimer | null = null;

		const requestResult = dependencies.request().then<
			PollRaceResult<TResult>,
			PollRaceResult<TResult>
		>(
			(value): PollRaceResult<TResult> => ({ kind: 'result', value }),
			(error: unknown): PollRaceResult<TResult> => ({ kind: 'error', error })
		);
		const timeoutResult = new Promise<PollRaceResult<TResult>>((resolve) => {
			timeoutTimer = setTimer(() => resolve({ kind: 'timeout' }), requestTimeoutMs);
		});

		const task = Promise.race([requestResult, timeoutResult])
			.then(async (result) => {
				if (timeoutTimer !== null) clearTimer(timeoutTimer);
				if (destroyed || requestGeneration !== generation) return;

				let decision: AnalysisPollingDecision;
				if (result.kind === 'result') {
					decision = await dependencies.handleResult(result.value);
				} else if (result.kind === 'error') {
					decision = dependencies.handleError(result.error);
				} else {
					decision = dependencies.handleTimeout();
				}

				if (destroyed || requestGeneration !== generation) return;
				if (decision === 'stop') stop();
				else schedule();
			})
			.finally(() => {
				if (inFlight === task) inFlight = null;
			});

		inFlight = task;
		return task;
	}

	async function sync(): Promise<void> {
		if (!dependencies.canPoll()) {
			stop();
			return;
		}
		await runNow();
	}

	function destroy(): void {
		destroyed = true;
		stop();
	}

	return {
		sync,
		runNow,
		schedule,
		stop,
		destroy,
		isRequestInFlight: () => inFlight !== null
	};
}
