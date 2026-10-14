// @ts-expect-error The repository intentionally has no global Node type package.
import { existsSync, readFileSync } from 'node:fs';
// @ts-expect-error The repository intentionally has no global Node type package.
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(relativePath: string): string {
	return readFileSync(resolve(relativePath), 'utf8').replaceAll('\r\n', '\n');
}

describe('compatibility wrapper consolidation', () => {
	it('connects Admin callers directly to the canonical console', () => {
		const route = source('src/routes/admin/+page.svelte');
		const preview = source(
			'src/lib/components/ComponentsBase/Panoptes/dev/PanoptesUiPreviewPage.svelte'
		);
		expect(route).toContain('ComponentsBase/AdminConsole.svelte');
		expect(preview).toContain('ComponentsBase/AdminConsole.svelte');
		expect(route + preview).not.toContain('ComponentsBase/admin/AdminConsole.svelte');
	});

	it('connects Landing callers directly to the canonical preview entries', () => {
		const primary = source('src/lib/components/ComponentsBase/LandingHeroPrimarySection.svelte');
		const secondary = source(
			'src/lib/components/ComponentsBase/LandingHeroSecondarySection.svelte'
		);
		expect(primary).toContain('ComponentsBase/AppTopDummy.svelte');
		expect(secondary).toContain('ComponentsBase/AppResultsDummy.svelte');
		expect(primary + secondary).not.toContain('ComponentsBase/dummy/AppTopDummy.svelte');
		expect(primary + secondary).not.toContain('ComponentsBase/dummy/AppResultsDummy.svelte');
	});

	it('preserves the canonical preview configurations', () => {
		const top = source('src/lib/components/ComponentsBase/AppTopDummy.svelte');
		const results = source('src/lib/components/ComponentsBase/AppResultsDummy.svelte');
		expect(top).toContain('withHeader');
		expect(top).toContain('showHero');
		expect(top).toContain('initialTab="industry"');
		expect(results).toContain('showHero={false}');
		expect(results).toContain('showSidebar={false}');
		expect(results).toContain('initialTab="competitor"');
	});

	it('removes only the audited transparent component aliases', () => {
		for (const path of [
			'src/lib/components/ComponentsBase/admin/AdminConsole.svelte',
			'src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte',
			'src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte'
		]) {
			expect(existsSync(resolve(path))).toBe(false);
		}
	});

	it('keeps Product URLs as route entry wrappers', () => {
		for (const path of [
			'src/routes/+page.svelte',
			'src/routes/lp/+page.svelte',
			'src/routes/plan/+page.svelte'
		]) {
			expect(source(path)).toContain('MarketingLandingPage');
		}
		for (const path of ['src/routes/app/+page.svelte', 'src/routes/app/analysis/+page.svelte']) {
			expect(source(path)).toContain('PanoptesShellEntryPage');
		}
	});

	it('removes the analysis pass-through layout while preserving the parent app layout', () => {
		expect(existsSync(resolve('src/routes/app/analysis/+layout.svelte'))).toBe(false);
		expect(existsSync(resolve('src/routes/app/+layout.svelte'))).toBe(true);
	});
});
