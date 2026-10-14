import { describe, expect, it } from 'vitest';
import { analyzeFrontendInventory } from '../../scripts/audit-frontend-components.mjs';

const inventory = analyzeFrontendInventory();

describe('frontend component inventory', () => {
	it('recomputes the current filesystem baseline', () => {
		expect(inventory.counts).toMatchObject({
			components: 107,
			features: 17,
			reusable: 124,
			routeSvelte: 12,
			totalSvelte: 136
		});
	});

	it('keeps production, dev-only, and deferred graphs separate', () => {
		expect(inventory.counts).toMatchObject({
			ACTIVE_CANONICAL: 119,
			DEV_ONLY: 3,
			DEFER: 2
		});
		expect(inventory.rows.filter((row) => row.classification === 'UNREACHABLE')).toHaveLength(0);
		expect(inventory.rows.filter((row) => row.classification === 'TEST_ONLY')).toHaveLength(0);
		expect(inventory.unresolved).toEqual([]);
		expect(inventory.cycles).toEqual([]);
	});

	it('retains the Product-dependent Strategy Plan Rail subgraph as DEFER', () => {
		const planRailRows = inventory.rows.filter((row) =>
			row.path.includes('/Strategy/rail/StrategyAnalysisPlanRail')
		);
		expect(planRailRows).toHaveLength(2);
		expect(planRailRows.every((row) => row.classification === 'DEFER')).toBe(true);
	});

	it('has no compatibility component wrappers after canonical import migration', () => {
		const wrappers = inventory.rows.filter((row) => row.classification === 'ACTIVE_WRAPPER');
		expect(wrappers).toEqual([]);
		expect(inventory.rows.map((row) => row.path)).not.toEqual(
			expect.arrayContaining([
				'src/lib/components/ComponentsBase/admin/AdminConsole.svelte',
				'src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte',
				'src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte'
			])
		);
	});
});
