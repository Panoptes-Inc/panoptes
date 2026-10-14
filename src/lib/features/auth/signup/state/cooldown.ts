export type CooldownController = {
	start: (seconds?: number) => void;
	clear: () => void;
	destroy: () => void;
};

export function createCooldownController(
	onTick: (remaining: number) => void,
	setIntervalFn: typeof setInterval = setInterval,
	clearIntervalFn: typeof clearInterval = clearInterval
): CooldownController {
	let timer: ReturnType<typeof setInterval> | null = null;
	let remaining = 0;

	function clear() {
		if (timer) clearIntervalFn(timer);
		timer = null;
		remaining = 0;
		onTick(0);
	}

	function start(seconds = 60) {
		if (timer) clearIntervalFn(timer);
		remaining = Math.max(0, seconds);
		onTick(remaining);
		if (remaining === 0) return;
		timer = setIntervalFn(() => {
			remaining = Math.max(0, remaining - 1);
			onTick(remaining);
			if (remaining === 0 && timer) {
				clearIntervalFn(timer);
				timer = null;
			}
		}, 1000);
	}

	return { start, clear, destroy: clear };
}
