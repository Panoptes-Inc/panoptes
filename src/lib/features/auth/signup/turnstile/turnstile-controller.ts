type TurnstileApi = {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			theme: 'light';
			size: 'normal';
			callback: (token: string) => void;
			'expired-callback': () => void;
			'error-callback': () => void;
		}
	) => string;
	reset: (widgetId?: string) => void;
	remove?: (widgetId: string) => void;
};

type TurnstileWindow = Window & { turnstile?: TurnstileApi };
let scriptPromise: Promise<void> | null = null;

function api(): TurnstileApi | undefined {
	return (window as TurnstileWindow).turnstile;
}

async function waitUntilReady(): Promise<void> {
	for (let attempts = 0; attempts < 50 && !api(); attempts += 1) {
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	if (!api()) throw new Error('TURNSTILE_NOT_READY');
}

export async function ensureTurnstileScript(): Promise<void> {
	if (api()) return;
	if (scriptPromise) return scriptPromise;

	scriptPromise = (async () => {
		const existing = document.querySelector<HTMLScriptElement>(
			'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
		);
		if (!existing) {
			await new Promise<void>((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
				script.async = true;
				script.defer = true;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('TURNSTILE_SCRIPT_LOAD_FAILED'));
				document.head.appendChild(script);
			});
		}
		await waitUntilReady();
	})().catch((error) => {
		scriptPromise = null;
		throw error;
	});

	return scriptPromise;
}

export async function mountTurnstile(
	container: HTMLElement,
	siteKey: string,
	callbacks: { onToken: (token: string) => void; onUnavailable: () => void }
) {
	await ensureTurnstileScript();
	const turnstile = api();
	if (!turnstile) throw new Error('TURNSTILE_NOT_READY');
	const widgetId = turnstile.render(container, {
		sitekey: siteKey,
		theme: 'light',
		size: 'normal',
		callback: callbacks.onToken,
		'expired-callback': callbacks.onUnavailable,
		'error-callback': callbacks.onUnavailable
	});
	return {
		reset: () => turnstile.reset(widgetId),
		destroy: () => turnstile.remove?.(widgetId)
	};
}
