import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import YAML from 'yaml';

const path = resolve('docs/api/openapi-draft.yaml');
const source = await readFile(path, 'utf8');
const document = YAML.parse(source);

function fail(message) {
	throw new Error(`OpenAPI validation failed: ${message}`);
}

if (!document || typeof document !== 'object') fail('document is not an object');
if (typeof document.openapi !== 'string' || !document.openapi.startsWith('3.1.')) {
	fail('openapi must use 3.1.x');
}
if (!document.info?.title || !document.info?.version)
	fail('info.title and info.version are required');
if (!document.paths || typeof document.paths !== 'object') fail('paths are required');
if (!document.components?.schemas || !document.components?.securitySchemes?.bearerAuth) {
	fail('schemas and bearerAuth are required');
}

const operationIds = new Set();
let operationCount = 0;
for (const [route, pathItem] of Object.entries(document.paths)) {
	const r1Routes = new Set([
		'/health',
		'/me',
		'/organizations',
		'/organizations/{organization_id}'
	]);
	if (!r1Routes.has(route) && !route.startsWith('/organizations/{organization_id}/')) {
		fail(`non-canonical organization path: ${route}`);
	}
	for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
		const operation = pathItem?.[method];
		if (!operation) continue;
		operationCount += 1;
		if (!operation.operationId) fail(`${method.toUpperCase()} ${route} has no operationId`);
		if (operationIds.has(operation.operationId)) {
			fail(`duplicate operationId: ${operation.operationId}`);
		}
		operationIds.add(operation.operationId);
		if (!operation.responses || Object.keys(operation.responses).length === 0) {
			fail(`${operation.operationId} has no responses`);
		}
	}
}

if (operationCount < 10)
	fail(`expected an MVP surface of at least 10 operations, got ${operationCount}`);

function resolveLocalRef(ref) {
	const parts = ref.slice(2).split('/');
	let value = document;
	for (const part of parts) value = value?.[part.replaceAll('~1', '/').replaceAll('~0', '~')];
	return value;
}

function visit(value, location = '#') {
	if (Array.isArray(value)) {
		value.forEach((child, index) => visit(child, `${location}/${index}`));
		return;
	}
	if (!value || typeof value !== 'object') return;
	for (const [key, child] of Object.entries(value)) {
		const childLocation = `${location}/${key}`;
		if (key === '$ref') {
			if (typeof child !== 'string' || !child.startsWith('#/')) {
				fail(`only local refs are allowed at ${childLocation}`);
			}
			if (!resolveLocalRef(child)) fail(`unresolved ref ${child} at ${childLocation}`);
		} else {
			visit(child, childLocation);
		}
	}
}

visit(document);
console.log(
	`PASS OpenAPI YAML (${operationCount} operations, ${operationIds.size} unique operationIds)`
);
