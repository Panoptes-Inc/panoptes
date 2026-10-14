// @ts-expect-error The repository intentionally has no global Node type package.
import { existsSync, readFileSync } from 'node:fs';
// @ts-expect-error The repository intentionally has no global Node type package.
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(relativePath: string): string {
	return readFileSync(resolve(relativePath), 'utf8').replaceAll('\r\n', '\n');
}

const marketingRoutePaths = [
	'src/routes/+page.svelte',
	'src/routes/lp/+page.svelte',
	'src/routes/plan/+page.svelte'
];

describe('current route alias behavior preservation', () => {
	it('keeps the three Marketing route wrappers exact and delegates composition', () => {
		const routes = marketingRoutePaths.map(source);
		expect(new Set(routes)).toHaveLength(1);
		for (const route of routes) {
			expect(route).toContain('MarketingLandingPage');
			expect(route).not.toContain('LandingHeroPrimarySection');
			expect(route).not.toContain('LandingHeroSecondarySection');
			expect(route).not.toContain('PanoptesSiteHeader');
		}
	});

	it('preserves Marketing Header and Hero order in the canonical composition', () => {
		const marketingPage = source('src/lib/features/landing/components/MarketingLandingPage.svelte');
		const header = marketingPage.lastIndexOf('<PanoptesSiteHeader');
		const primary = marketingPage.lastIndexOf('<LandingHeroPrimarySection');
		const secondary = marketingPage.lastIndexOf('<LandingHeroSecondarySection');
		expect(header).toBeGreaterThan(-1);
		expect(header).toBeLessThan(primary);
		expect(primary).toBeLessThan(secondary);
	});

	it('keeps /app and /app/analysis as exact wrappers of the same Shell entry', () => {
		const app = source('src/routes/app/+page.svelte');
		const analysis = source('src/routes/app/analysis/+page.svelte');
		expect(app).toBe(analysis);
		expect(app).toContain('PanoptesShellEntryPage');
		expect(app).toContain('organizationId={data.activeOrganizationId}');
	});

	it('does not infer an analysis-specific tab from /app/analysis', () => {
		const shell = source('src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte');
		expect(shell).not.toContain('$page.url.pathname');
		expect(shell).toContain("let activeTab = $state<SnapshotTabId>('strategy')");
	});

	it('inherits the /app layout without a redundant analysis pass-through layout', () => {
		expect(existsSync(resolve('src/routes/app/analysis/+layout.svelte'))).toBe(false);
	});

	it('keeps the removed temporary settings route absent', () => {
		expect(existsSync(resolve('src/routes/app/login/settings/+page.svelte'))).toBe(false);
	});

	it('keeps only /app/analysis connected to an in-app navigation source', () => {
		const search = source(
			'src/lib/components/ComponentsBase/PanoptesAnalysisStartSearchBar.svelte'
		);
		expect(search).toContain("goto('/app/analysis')");
		const navigableSource =
			source('src/lib/components/ComponentsBase/PanoptesSiteHeader.svelte') + search;
		expect(navigableSource).not.toContain("'/lp'");
		expect(navigableSource).not.toContain("'/plan'");
		expect(navigableSource).not.toContain("'/app/login/settings'");
	});

	it('keeps the Landing preview dependency explicit', () => {
		const primary = source('src/lib/components/ComponentsBase/LandingHeroPrimarySection.svelte');
		const secondary = source(
			'src/lib/components/ComponentsBase/LandingHeroSecondarySection.svelte'
		);
		const topPreview = source('src/lib/components/ComponentsBase/AppTopDummy.svelte');
		const resultsPreview = source('src/lib/components/ComponentsBase/AppResultsDummy.svelte');
		expect(primary).toContain('ComponentsBase/AppTopDummy.svelte');
		expect(secondary).toContain('ComponentsBase/AppResultsDummy.svelte');
		expect(topPreview).toContain('PanoptesAppShellDummy');
		expect(resultsPreview).toContain('PanoptesAppShellDummy');
	});
});
