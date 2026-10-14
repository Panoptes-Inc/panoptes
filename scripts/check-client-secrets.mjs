import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const root = process.cwd();
const clientOutput = join(root, '.svelte-kit', 'output', 'client');
const sourceRoot = join(root, 'src');
const forbiddenIdentifier = 'SUPABASE_SERVICE_ROLE_KEY';
const knownSecret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.svelte', '.json', '.html', '.css']);

async function filesBelow(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await filesBelow(path)));
		else if (textExtensions.has(extname(entry.name))) files.push(path);
	}
	return files;
}

function isServerOnlySource(path) {
	const normalized = relative(sourceRoot, path).split(sep).join('/');
	return (
		normalized.startsWith('lib/server/') ||
		normalized === 'hooks.server.ts' ||
		normalized.endsWith('.server.ts') ||
		normalized.endsWith('/+server.ts')
	);
}

const clientFiles = await filesBelow(clientOutput);
const sourceFiles = (await filesBelow(sourceRoot)).filter((path) => !isServerOnlySource(path));
const failures = [];

for (const path of [...clientFiles, ...sourceFiles]) {
	const content = await readFile(path, 'utf8');
	if (content.includes(forbiddenIdentifier)) failures.push(relative(root, path));
	if (knownSecret.length >= 16 && content.includes(knownSecret))
		failures.push(relative(root, path));
}

if (failures.length > 0) {
	throw new Error(
		`Server-only Supabase secret material found in client-visible files: ${failures.join(', ')}`
	);
}

console.log(`PASS client secret boundary (${clientFiles.length} build files scanned)`);
