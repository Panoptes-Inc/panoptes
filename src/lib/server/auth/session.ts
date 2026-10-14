type CallbackAuthClient = {
	auth: {
		exchangeCodeForSession(code: string): Promise<{ error: unknown }>;
	};
};

type LogoutAuthClient = {
	auth: {
		signOut(options: { scope: 'local' }): Promise<{ error: unknown }>;
	};
};

export async function exchangeSupabaseAuthCode(
	client: CallbackAuthClient | null,
	code: string | null
): Promise<boolean> {
	if (!client || !code) return false;
	const { error } = await client.auth.exchangeCodeForSession(code);
	return !error;
}

export async function terminateLocalSupabaseSession(
	client: LogoutAuthClient | null
): Promise<void> {
	if (!client) return;
	try {
		await client.auth.signOut({ scope: 'local' });
	} catch {
		// Local cookies are cleared by the route even when the provider is unavailable.
	}
}
