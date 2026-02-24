import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

type JoinWaitlistBody = {
	email?: unknown;
	source?: unknown;
	pagePath?: unknown;
	websiteUrl?: unknown;
	turnstileToken?: unknown;
};

type TurnstileVerifyResponse = {
	success: boolean;
	'error-codes'?: string[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>();

function normalizeOptionalString(value: unknown, maxLength: number) {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, maxLength);
}

function isMissingJoinWaitlist4Arg(message: string) {
	return /function public\.join_waitlist\(text,\s*text,\s*text,\s*text\) does not exist|no function matches/i.test(message);
}

function getClientIpFromHeaders(headers: Headers) {
	const cfIp = headers.get('cf-connecting-ip');
	if (cfIp) return cfIp.trim();
	const forwarded = headers.get('x-forwarded-for');
	if (!forwarded) return '';
	return forwarded.split(',')[0]?.trim() ?? '';
}

function getRateLimitKey(headers: Headers) {
	const ip = getClientIpFromHeaders(headers);
	if (ip) return `ip:${ip}`;
	const userAgent = headers.get('user-agent')?.slice(0, 120) ?? 'unknown';
	return `ua:${userAgent}`;
}

function sweepRateLimitBuckets(now: number) {
	if (rateLimitBuckets.size < 5000) return;
	for (const [key, bucket] of rateLimitBuckets) {
		if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
			rateLimitBuckets.delete(key);
		}
	}
}

function checkRateLimit(key: string) {
	const now = Date.now();
	sweepRateLimitBuckets(now);
	const existing = rateLimitBuckets.get(key);

	if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
		rateLimitBuckets.set(key, { count: 1, windowStart: now });
		return { limited: false as const, retryAfterSeconds: 0 };
	}

	if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
		const elapsed = now - existing.windowStart;
		const retryAfterSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000));
		return { limited: true as const, retryAfterSeconds };
	}

	existing.count += 1;
	return { limited: false as const, retryAfterSeconds: 0 };
}

async function verifyTurnstile(token: string, remoteIp: string) {
	const secret = env.TURNSTILE_SECRET_KEY;
	if (!secret) {
		return { ok: false as const, errorCodes: ['missing-input-secret'] };
	}

	const body = new URLSearchParams();
	body.set('secret', secret);
	body.set('response', token);
	if (remoteIp) {
		body.set('remoteip', remoteIp);
	}

	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString()
	});

	if (!response.ok) {
		return { ok: false as const, errorCodes: ['verification-request-failed'] };
	}

	const data = (await response.json()) as TurnstileVerifyResponse;
	if (!data.success) {
		return { ok: false as const, errorCodes: data['error-codes'] ?? ['verification-failed'] };
	}

	return { ok: true as const, errorCodes: [] as string[] };
}

function createServiceRoleClient() {
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!PUBLIC_SUPABASE_URL || !serviceRoleKey) return null;

	return createClient(PUBLIC_SUPABASE_URL, serviceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	});
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const rateLimit = checkRateLimit(getRateLimitKey(request.headers));
		if (rateLimit.limited) {
			return json(
				{ ok: false, code: 'RATE_LIMITED' },
				{
					status: 429,
					headers: {
						'Retry-After': String(rateLimit.retryAfterSeconds)
					}
				}
			);
		}

		const body = (await request.json()) as JoinWaitlistBody;

		const email = normalizeOptionalString(body.email, 320)?.toLowerCase() ?? '';
		const source = normalizeOptionalString(body.source, 64);
		const pagePath = normalizeOptionalString(body.pagePath, 512);
		const websiteUrl = normalizeOptionalString(body.websiteUrl, 1024);
		const turnstileToken = normalizeOptionalString(body.turnstileToken, 4096);

		if (!emailPattern.test(email)) {
			return json({ ok: false, code: 'INVALID_EMAIL' }, { status: 400 });
		}

		if (websiteUrl && !/^https?:\/\/.+/i.test(websiteUrl)) {
			return json({ ok: false, code: 'INVALID_WEBSITE_URL' }, { status: 400 });
		}

		if (!turnstileToken) {
			return json({ ok: false, code: 'CAPTCHA_REQUIRED' }, { status: 400 });
		}

		const remoteIp = getClientIpFromHeaders(request.headers);
		const captcha = await verifyTurnstile(turnstileToken, remoteIp);
		if (!captcha.ok) {
			return json({ ok: false, code: 'CAPTCHA_FAILED' }, { status: 400 });
		}

		const supabase = createServiceRoleClient();
		if (!supabase) {
			return json({ ok: false, code: 'SERVER_MISCONFIG' }, { status: 503 });
		}

		let rpc = await supabase.rpc('join_waitlist', {
			p_email: email,
			p_source: source,
			p_page_path: pagePath,
			p_website_url: websiteUrl
		});

		if (rpc.error && isMissingJoinWaitlist4Arg(rpc.error.message ?? '')) {
			rpc = await supabase.rpc('join_waitlist', {
				p_email: email,
				p_source: source,
				p_page_path: pagePath
			});
		}

		if (rpc.error) {
			console.error('[waitlist/join] join_waitlist rpc failed', rpc.error);
			return json(
				{
					ok: false,
					code: 'WAITLIST_RPC_FAILED'
				},
				{ status: 500 }
			);
		}

		return json({
			ok: true,
			data: rpc.data
		});
	} catch (error) {
		console.error('[waitlist/join] bad request', error);
		return json({ ok: false, code: 'BAD_REQUEST' }, { status: 400 });
	}
};
