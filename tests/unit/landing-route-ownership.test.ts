// @ts-expect-error The repository intentionally has no global Node type package.
import { readFileSync } from 'node:fs';
// @ts-expect-error The repository intentionally has no global Node type package.
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = (relativePath: string) =>
	readFileSync(resolve('src/routes', relativePath), 'utf8');

const count = (source: string, pattern: RegExp) => source.match(pattern)?.length ?? 0;

describe('landing route hero ownership', () => {
	it('keeps shared layouts free of page-specific Hero ownership', () => {
		const rootLayout = routeSource('+layout.svelte');

		expect(rootLayout).not.toContain('LandingHeroPrimarySection');
		expect(rootLayout).not.toContain('LandingHeroSecondarySection');
	});

	it.each(['+page.svelte', 'lp/+page.svelte', 'plan/+page.svelte'])(
		'delegates Marketing composition once from %s',
		(pagePath) => {
			const page = routeSource(pagePath);

			expect(count(page, /<MarketingLandingPage\s+authenticated=/g)).toBe(1);
			expect(page).not.toContain('LandingHeroPrimarySection');
			expect(page).not.toContain('LandingHeroSecondarySection');
		}
	);

	it('keeps Header, Primary, and Secondary ownership in the canonical Marketing composition', () => {
		const composition = readFileSync(
			resolve('src/lib/features/landing/components/MarketingLandingPage.svelte'),
			'utf8'
		);

		expect(count(composition, /<PanoptesSiteHeader\s+\{authenticated\}\s*\/>/g)).toBe(1);
		expect(count(composition, /<LandingHeroPrimarySection\s*\/>/g)).toBe(1);
		expect(count(composition, /<LandingHeroSecondarySection\s*\/>/g)).toBe(1);
	});
});
