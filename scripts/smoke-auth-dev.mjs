import { spawn } from 'node:child_process';

const host = '127.0.0.1';
const timeoutMs = 30_000;
const scenarios = [
	{
		name: 'member',
		port: 4174,
		requests: [
			{ path: '/app', status: 200 },
			{ path: '/admin', status: 403 }
		]
	},
	{
		name: 'unaffiliated',
		port: 4175,
		requests: [{ path: '/app', status: 303, location: '/organization/select' }]
	},
	{
		name: 'system-admin',
		port: 4176,
		requests: [{ path: '/admin', status: 200 }]
	},
	{
		name: 'developer',
		port: 4177,
		requests: [{ path: '/app/dev/ui', status: 200 }]
	}
];

async function waitForServer(server, baseUrl, output) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (server.exitCode !== null) {
			throw new Error(`Dev server exited early (${server.exitCode}).\n${output.value}`);
		}

		try {
			const response = await fetch(baseUrl);
			if (response.ok) return;
		} catch {
			// The server is still starting.
		}

		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	throw new Error(`Dev server did not start within ${timeoutMs}ms.\n${output.value}`);
}

async function stopServer(server) {
	if (server.exitCode !== null) return;
	server.kill('SIGTERM');
	await Promise.race([
		new Promise((resolve) => server.once('exit', resolve)),
		new Promise((resolve) => setTimeout(resolve, 2_000))
	]);
}

for (const scenario of scenarios) {
	const baseUrl = `http://${host}:${scenario.port}`;
	const output = { value: '' };
	const server = spawn(
		process.execPath,
		[
			'node_modules/vite/bin/vite.js',
			'--host',
			host,
			'--port',
			String(scenario.port),
			'--strictPort'
		],
		{
			stdio: ['ignore', 'pipe', 'pipe'],
			env: {
				...process.env,
				PANOPTES_ENABLE_MOCK_AUTH: 'true',
				PANOPTES_MOCK_AUTH_SCENARIO: scenario.name,
				PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co',
				PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ?? 'ci-placeholder-anon-key'
			}
		}
	);

	server.stdout.on('data', (chunk) => (output.value += chunk));
	server.stderr.on('data', (chunk) => (output.value += chunk));

	try {
		await waitForServer(server, baseUrl, output);

		for (const request of scenario.requests) {
			const response = await fetch(`${baseUrl}${request.path}`, { redirect: 'manual' });
			if (response.status !== request.status) {
				throw new Error(
					`${scenario.name} ${request.path} returned ${response.status}; expected ${request.status}`
				);
			}

			if (request.location && !response.headers.get('location')?.startsWith(request.location)) {
				throw new Error(`${scenario.name} ${request.path} had an unexpected redirect`);
			}

			console.log(`PASS ${scenario.name} ${request.path} (${response.status})`);
		}
	} finally {
		await stopServer(server);
	}
}
