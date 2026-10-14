export function safeReturnTo(value: string | null, fallback = '/app'): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
		return fallback;
	}

	try {
		const base = new URL('https://panoptes.local');
		const target = new URL(value, base);
		if (target.origin !== base.origin) return fallback;
		return `${target.pathname}${target.search}${target.hash}`;
	} catch {
		return fallback;
	}
}
