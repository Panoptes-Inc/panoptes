import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(workspaceRoot, 'src');
const reusableRoots = [
	path.join(sourceRoot, 'lib', 'components'),
	path.join(sourceRoot, 'lib', 'features')
];
const sourceExtensions = ['.svelte', '.svelte.ts', '.ts', '.js', '.mjs'];

const wrapperDecisions = new Map();

const deferredComponents = new Map([
	[
		'src/lib/components/ComponentsBase/Strategy/rail/StrategyAnalysisPlanRail.svelte',
		'Product decision required: plan selection and project selection are not equivalent'
	],
	[
		'src/lib/components/ComponentsBase/Strategy/rail/StrategyAnalysisPlanRailCard.svelte',
		'Product decision required: retained child of the deferred Plan Rail'
	]
]);

function toPosix(filePath) {
	return path.relative(workspaceRoot, filePath).split(path.sep).join('/');
}

function walk(directory) {
	if (!fs.existsSync(directory)) return [];
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(entryPath) : [entryPath];
	});
}

function sourceFilesUnder(directory) {
	return walk(directory).filter((filePath) =>
		sourceExtensions.some((extension) => filePath.endsWith(extension))
	);
}

function importSpecifiers(source) {
	const specifiers = new Set();
	const staticImport = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
	const dynamicImport = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
	for (const pattern of [staticImport, dynamicImport]) {
		for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
	}
	return [...specifiers];
}

function resolveImport(importer, specifier) {
	let candidate;
	if (specifier.startsWith('$lib/')) {
		candidate = path.join(sourceRoot, 'lib', specifier.slice('$lib/'.length));
	} else if (specifier.startsWith('.')) {
		candidate = path.resolve(path.dirname(importer), specifier);
	} else {
		return undefined;
	}

	const candidates = [
		candidate,
		...sourceExtensions.map((extension) => `${candidate}${extension}`),
		...sourceExtensions.map((extension) => path.join(candidate, `index${extension}`))
	];
	return candidates.find((filePath) => fs.existsSync(filePath) && fs.statSync(filePath).isFile());
}

function buildGraph(files) {
	const graph = new Map();
	const reverseGraph = new Map();
	const unresolved = [];
	for (const filePath of files) {
		const imports = [];
		for (const specifier of importSpecifiers(fs.readFileSync(filePath, 'utf8'))) {
			const resolved = resolveImport(filePath, specifier);
			if (resolved) imports.push(resolved);
			else if (
				(specifier.startsWith('.') || specifier.startsWith('$lib/')) &&
				!specifier.endsWith('/$types') &&
				(!path.extname(specifier) ||
					sourceExtensions.some((extension) => specifier.endsWith(extension)))
			) {
				unresolved.push({ importer: toPosix(filePath), specifier });
			}
		}
		graph.set(filePath, new Set(imports));
		for (const importedFile of imports) {
			if (!reverseGraph.has(importedFile)) reverseGraph.set(importedFile, new Set());
			reverseGraph.get(importedFile).add(filePath);
		}
	}
	return { graph, reverseGraph, unresolved };
}

function findCycles(graph) {
	const cycles = [];
	const visited = new Set();
	const active = new Set();
	const stack = [];

	function visit(node) {
		if (active.has(node)) {
			const cycleStart = stack.indexOf(node);
			cycles.push([...stack.slice(cycleStart), node].map(toPosix));
			return;
		}
		if (visited.has(node)) return;
		visited.add(node);
		active.add(node);
		stack.push(node);
		for (const child of graph.get(node) ?? []) visit(child);
		stack.pop();
		active.delete(node);
	}

	for (const node of graph.keys()) visit(node);
	return cycles;
}

function inheritedRouteEntries(pageFile) {
	const entries = [pageFile];
	let directory = path.dirname(pageFile);
	const routesRoot = path.join(sourceRoot, 'routes');
	while (directory.startsWith(routesRoot)) {
		const layout = path.join(directory, '+layout.svelte');
		if (fs.existsSync(layout)) entries.push(layout);
		if (directory === routesRoot) break;
		directory = path.dirname(directory);
	}
	return entries;
}

function routeName(pageFile) {
	const relativeDirectory = path.relative(path.join(sourceRoot, 'routes'), path.dirname(pageFile));
	return relativeDirectory ? `/${relativeDirectory.split(path.sep).join('/')}` : '/';
}

function reachableFrom(graph, entries) {
	const reached = new Set();
	const queue = [...entries];
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || reached.has(current)) continue;
		reached.add(current);
		for (const child of graph.get(current) ?? []) queue.push(child);
	}
	return reached;
}

function nearestSvelteNodes(start, graph) {
	const found = new Set();
	const visited = new Set();
	const queue = [...(graph.get(start) ?? [])];
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || visited.has(current)) continue;
		visited.add(current);
		if (current.endsWith('.svelte')) {
			found.add(current);
			continue;
		}
		for (const next of graph.get(current) ?? []) queue.push(next);
	}
	return [...found];
}

function lineCount(filePath) {
	const source = fs.readFileSync(filePath, 'utf8');
	return source.length === 0 ? 0 : source.split(/\r?\n/).length - (source.endsWith('\n') ? 1 : 0);
}

function lastMajorPhase(relativePath) {
	if (relativePath.endsWith('/MarketingLandingPage.svelte')) return 'B-3Q';
	if (/features\/auth\/signup|ComponentsBase\/SignUp/.test(relativePath)) return 'B-3A';
	if (/features\/survey|ComponentsBase\/SurveyModal/.test(relativePath)) return 'B-3B';
	if (/features\/contact|ComponentsBase\/ContactModal/.test(relativePath)) return 'B-3D';
	if (/features\/landing|LandingHero/.test(relativePath)) return 'B-3G';
	if (/panoptes-shell|Panoptes\/analysis|Panoptes\/PanoptesShellPage/.test(relativePath))
		return 'B-3K';
	if (/Strategy\/roadmap/.test(relativePath)) return 'B-3L';
	if (/Competitor\/detail/.test(relativePath)) return 'B-3M';
	if (/Self\/overview/.test(relativePath)) return 'B-3N';
	if (/Competitor\/cards|Competitor\/data/.test(relativePath)) return 'B-3O';
	if (/ComponentsBase\/admin|ComponentsBase\/AdminConsole/.test(relativePath)) return 'A-1';
	if (/Panoptes\/snapshot|industry\/|Self\/|Strategy\//.test(relativePath)) return 'B-2';
	return 'pre-B-3';
}

function csvCell(value) {
	return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function toCsv(rows) {
	const headers = [
		'component',
		'path',
		'lines',
		'production_reachable',
		'production_routes',
		'parents',
		'children',
		'classification',
		'last_major_phase',
		'wrapper_disposition',
		'notes'
	];
	return `${headers.map(csvCell).join(',')}\n${rows
		.map((row) => headers.map((header) => csvCell(row[header])).join(','))
		.join('\n')}\n`;
}

export function analyzeFrontendInventory() {
	const sourceFiles = sourceFilesUnder(sourceRoot);
	const reusableFiles = reusableRoots
		.flatMap(sourceFilesUnder)
		.filter((filePath) => filePath.endsWith('.svelte'));
	const routeFiles = sourceFilesUnder(path.join(sourceRoot, 'routes')).filter((filePath) =>
		filePath.endsWith('.svelte')
	);
	const routePages = routeFiles.filter((filePath) => path.basename(filePath) === '+page.svelte');
	const productionPages = routePages.filter((filePath) => !toPosix(filePath).includes('/dev/'));
	const devPages = routePages.filter((filePath) => toPosix(filePath).includes('/dev/'));
	const testFiles = sourceFilesUnder(path.join(workspaceRoot, 'tests'));
	const { graph, reverseGraph, unresolved } = buildGraph([
		...new Set([...sourceFiles, ...testFiles])
	]);

	const productionRouteReachability = new Map(
		productionPages.map((pageFile) => [
			routeName(pageFile),
			reachableFrom(graph, inheritedRouteEntries(pageFile))
		])
	);
	const productionReachable = new Set(
		[...productionRouteReachability.values()].flatMap((files) => [...files])
	);
	const devReachable = reachableFrom(graph, devPages.flatMap(inheritedRouteEntries));
	const testReachable = reachableFrom(graph, testFiles);

	const rows = reusableFiles
		.map((filePath) => {
			const relativePath = toPosix(filePath);
			const routes = [...productionRouteReachability.entries()]
				.filter(([, reached]) => reached.has(filePath))
				.map(([route]) => route)
				.sort();
			const wrapper = wrapperDecisions.get(relativePath);
			const deferredReason = deferredComponents.get(relativePath);
			let classification = 'UNREACHABLE';
			if (productionReachable.has(filePath))
				classification = wrapper ? 'ACTIVE_WRAPPER' : 'ACTIVE_CANONICAL';
			else if (devReachable.has(filePath)) classification = 'DEV_ONLY';
			else if (testReachable.has(filePath)) classification = 'TEST_ONLY';
			else if (deferredReason) classification = 'DEFER';

			const parents = nearestSvelteNodes(filePath, reverseGraph).map(toPosix).sort();
			const children = nearestSvelteNodes(filePath, graph).map(toPosix).sort();
			return {
				component: path.basename(filePath, '.svelte'),
				path: relativePath,
				lines: lineCount(filePath),
				production_reachable: productionReachable.has(filePath) ? 'yes' : 'no',
				production_routes: routes.join(';'),
				parents: parents.join(';'),
				children: children.join(';'),
				classification,
				last_major_phase: lastMajorPhase(relativePath),
				wrapper_disposition: wrapper?.[0] ?? '',
				notes: wrapper?.[1] ?? deferredReason ?? ''
			};
		})
		.sort((left, right) => left.path.localeCompare(right.path));

	const counts = rows.reduce((result, row) => {
		result[row.classification] = (result[row.classification] ?? 0) + 1;
		return result;
	}, {});

	return {
		rows,
		csv: toCsv(rows),
		counts: {
			components: reusableFiles.filter((filePath) =>
				toPosix(filePath).startsWith('src/lib/components/')
			).length,
			features: reusableFiles.filter((filePath) =>
				toPosix(filePath).startsWith('src/lib/features/')
			).length,
			reusable: reusableFiles.length,
			routeSvelte: routeFiles.length,
			totalSvelte: reusableFiles.length + routeFiles.length,
			...counts
		},
		productionRoutes: [...productionRouteReachability.keys()].sort(),
		devRoutes: devPages.map(routeName).sort(),
		unresolved,
		cycles: findCycles(graph)
	};
}

function runCli() {
	const result = analyzeFrontendInventory();
	const targets = [
		path.join(workspaceRoot, 'docs', 'audit', 'frontend-component-inventory.csv'),
		path.join(workspaceRoot, 'docs', 'audit', 'component-inventory.csv')
	];
	const checkOnly = process.argv.includes('--check');
	if (checkOnly) {
		const staleTargets = targets.filter(
			(target) => !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== result.csv
		);
		if (staleTargets.length > 0) {
			console.error(`Frontend inventory is stale: ${staleTargets.map(toPosix).join(', ')}`);
			process.exitCode = 1;
			return;
		}
		if (result.unresolved.length > 0 || result.cycles.length > 0) {
			console.error(
				`Frontend graph invalid: ${result.unresolved.length} unresolved local imports, ${result.cycles.length} cycles`
			);
			process.exitCode = 1;
			return;
		}
	} else {
		for (const target of targets) fs.writeFileSync(target, result.csv, 'utf8');
	}
	console.log(
		JSON.stringify(
			{
				counts: result.counts,
				productionRoutes: result.productionRoutes,
				devRoutes: result.devRoutes,
				unresolvedImports: result.unresolved.length,
				cycles: result.cycles.length
			},
			null,
			2
		)
	);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
