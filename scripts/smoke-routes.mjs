import { spawn } from 'node:child_process';

const host = '127.0.0.1';
const port = 4173;
const baseUrl = `http://${host}:${port}`;
const routes = [
	{ path: '/', status: 200 },
	{ path: '/lp', status: 200 },
	{ path: '/plan', status: 200 },
	{ path: '/login', status: 200 },
	{ path: '/organization/select', status: 303, location: '/login' },
	{ path: '/app', status: 303, location: '/login' },
	{ path: '/app/analysis', status: 303, location: '/login' },
	{ path: '/admin', status: 303, location: '/login' },
	{ path: '/app/dev/ui', status: 404 },
	{ path: '/dev/analysis-preview', status: 404 }
];
const timeoutMs = 30_000;

const server = spawn(
	process.execPath,
	[
		'node_modules/vite/bin/vite.js',
		'preview',
		'--host',
		host,
		'--port',
		String(port),
		'--strictPort'
	],
	{
		stdio: ['ignore', 'pipe', 'pipe'],
		env: {
			...process.env,
			PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co',
			PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ?? 'ci-placeholder-anon-key',
			PUBLIC_USE_MOCK_API: process.env.PUBLIC_USE_MOCK_API ?? 'true'
		}
	}
);

let serverOutput = '';
server.stdout.on('data', (chunk) => (serverOutput += chunk));
server.stderr.on('data', (chunk) => (serverOutput += chunk));

async function waitForServer() {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (server.exitCode !== null) {
			throw new Error(`Preview server exited early (${server.exitCode}).\n${serverOutput}`);
		}

		try {
			const response = await fetch(baseUrl);
			if (response.ok) return;
		} catch {
			// The server is still starting.
		}

		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	throw new Error(`Preview server did not start within ${timeoutMs}ms.\n${serverOutput}`);
}

try {
	await waitForServer();

	for (const route of routes) {
		const response = await fetch(`${baseUrl}${route.path}`, { redirect: 'manual' });
		if (response.status !== route.status) {
			throw new Error(`${route.path} returned HTTP ${response.status}; expected ${route.status}`);
		}

		if (route.location) {
			const location = response.headers.get('location');
			if (!location?.startsWith(route.location)) {
				throw new Error(`${route.path} redirected to ${location}; expected ${route.location}`);
			}
		}

		console.log(`PASS ${route.path} (${response.status})`);
	}
} finally {
	server.kill('SIGTERM');
}
