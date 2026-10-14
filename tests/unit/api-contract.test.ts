import { describe, expect, it } from 'vitest';
import YAML from 'yaml';
import openApiSource from '../../docs/api/openapi-draft.yaml?raw';
import { mockPanoptesApiClient } from '../../src/lib/panoptes/api/mock-backend';

const expectedClientMethods = [
	'listProjects',
	'getProjectDetail',
	'createAndStartAnalysis',
	'pollAnalysisProgress',
	'confirmInference',
	'reanalyzeProject',
	'selectStrategy',
	'updateTaskStatus',
	'getUsageState'
] as const;

describe('Panoptes API contract draft', () => {
	it('parses as OpenAPI 3.1 and keeps operation IDs unique', () => {
		const document = YAML.parse(openApiSource) as {
			openapi: string;
			paths: Record<string, Record<string, { operationId?: string }>>;
		};
		const operationIds = Object.values(document.paths).flatMap((pathItem) =>
			Object.values(pathItem)
				.map((operation) => operation.operationId)
				.filter((value): value is string => Boolean(value))
		);

		expect(document.openapi).toMatch(/^3\.1\./);
		expect(operationIds.length).toBeGreaterThanOrEqual(10);
		expect(new Set(operationIds).size).toBe(operationIds.length);
	});

	it('keeps the mock adapter aligned with the complete current client interface', () => {
		expect(Object.keys(mockPanoptesApiClient).sort()).toEqual([...expectedClientMethods].sort());
	});

	it('returns the current project/detail/create/usage contract shapes', async () => {
		const collection = await mockPanoptesApiClient.listProjects();
		expect(collection.items.length).toBeGreaterThan(0);

		const detail = await mockPanoptesApiClient.getProjectDetail(collection.items[0]!.projectId);
		expect(detail.project.projectId).toBe(collection.items[0]!.projectId);
		expect(detail.projectSummary.projectId).toBe(detail.project.projectId);

		const created = await mockPanoptesApiClient.createAndStartAnalysis({
			targetUrl: 'https://contract-test.example',
			projectName: 'Contract Test',
			idempotencyKey: 'contract_test_create_0001',
			preserveCurrentSelection: true
		});
		expect(created.analysisJob.projectId).toBe(created.project.projectId);
		expect(created.projectSummary.projectId).toBe(created.project.projectId);

		const usage = await mockPanoptesApiClient.getUsageState();
		expect(usage.tokenUsageRate).toBeTypeOf('number');
		expect(usage.projectDayMax).toBeGreaterThan(0);
	});
});
