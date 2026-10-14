import type { WaitlistJoinCode, WaitlistResult } from '../types';

type WaitlistApiResponse =
	| { ok: true; data: { code: WaitlistJoinCode; message: string } | null }
	| { ok: false; code?: string; message?: string; errorCodes?: string[] };

export type JoinWaitlistInput = {
	email: string;
	websiteUrl: string | null;
	pagePath: string;
	turnstileToken: string;
};

export async function joinWaitlist(
	input: JoinWaitlistInput,
	fetchFn: typeof fetch = fetch
): Promise<WaitlistResult> {
	try {
		const response = await fetchFn('/api/waitlist/join', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: input.email,
				source: 'coming-soon',
				pagePath: input.pagePath,
				websiteUrl: input.websiteUrl,
				turnstileToken: input.turnstileToken
			})
		});

		const payload = (await response.json().catch(() => null)) as WaitlistApiResponse | null;
		if (!payload || payload.ok !== true) {
			const failed = payload && payload.ok === false ? payload : null;
			const code = failed?.code ?? 'WAITLIST_FAILED';
			return {
				ok: false,
				code,
				retryable: code === 'RATE_LIMITED' || code === 'WAITLIST_NETWORK' || response.status >= 500
			};
		}

		return {
			ok: true,
			code: payload.data?.code ?? null,
			message: payload.data?.message ?? ''
		};
	} catch {
		return { ok: false, code: 'WAITLIST_NETWORK', retryable: true };
	}
}
