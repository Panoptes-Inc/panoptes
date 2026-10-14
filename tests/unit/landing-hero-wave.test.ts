import { describe, expect, it } from 'vitest';
import {
	buildLandingHeroBoundary,
	buildLandingHeroShape,
	createLandingHeroCleanup,
	createLandingHeroSvgIds,
	LANDING_HERO_PRIMARY_WAVE_CONFIG,
	LANDING_HERO_SECONDARY_WAVE_CONFIG,
	smoothstep01
} from '../../src/lib/features/landing/animation/landing-hero-wave';

describe('landing hero wave geometry', () => {
	it('clamps smoothstep inputs to the unit interval', () => {
		expect(smoothstep01(-1)).toBe(0);
		expect(smoothstep01(0.5)).toBe(0.5);
		expect(smoothstep01(2)).toBe(1);
	});

	it('builds a deterministic boundary with the fixed terminal point', () => {
		const boundary = buildLandingHeroBoundary({ t: 0 });
		expect(buildLandingHeroBoundary({ t: 0 })).toBe(boundary);
		expect(boundary).toMatch(/0\.00 0\.00$/);
	});

	it('changes the wave while preserving the path contract over time', () => {
		const initial = buildLandingHeroBoundary({ t: 0 });
		const advanced = buildLandingHeroBoundary({ t: 1 });
		expect(advanced).not.toBe(initial);
		expect(advanced.split('C ')).toHaveLength(initial.split('C ').length);
	});

	it('preserves the two historical shape heads', () => {
		expect(buildLandingHeroShape('A', 'C 0 0 0 0 0 0')).toBe(
			'M1 0 V1100 C1000 1200 1000 1188 1980 1168 C 0 0 0 0 0 0 Z'
		);
		expect(buildLandingHeroShape('B', 'C 0 0 0 0 0 0')).toBe(
			'M1 0 V1100 C1000 1300 1180 1000 1980 1168 C 0 0 0 0 0 0 Z'
		);
	});

	it('keeps explicit Primary and Secondary animation configs', () => {
		expect(LANDING_HERO_PRIMARY_WAVE_CONFIG).not.toBe(LANDING_HERO_SECONDARY_WAVE_CONFIG);
		expect(LANDING_HERO_PRIMARY_WAVE_CONFIG).toEqual({
			amplitude: 62,
			waves: 1.6,
			flowSpeed: 0.4,
			pinPointWidth: 0.06,
			introDuration: 1.4,
			gradientOffset: 300,
			gradientDuration: 6
		});
		expect(LANDING_HERO_SECONDARY_WAVE_CONFIG).toEqual(LANDING_HERO_PRIMARY_WAVE_CONFIG);
	});

	it.each([
		['Primary', LANDING_HERO_PRIMARY_WAVE_CONFIG],
		['Secondary', LANDING_HERO_SECONDARY_WAVE_CONFIG]
	] as const)('builds deterministic output from the %s config', (_name, config) => {
		const options = {
			t: 2,
			amp: config.amplitude,
			waves: config.waves,
			flowSpeed: config.flowSpeed,
			pinPointWidth: config.pinPointWidth
		};

		expect(buildLandingHeroBoundary(options)).toBe(buildLandingHeroBoundary(options));
	});

	it('creates complete non-overlapping SVG IDs per instance', () => {
		const first = createLandingHeroSvgIds('primary-a');
		const second = createLandingHeroSvgIds('primary-b');

		expect(first).toEqual({
			shapeA: 'primary-a-shape-a',
			shapeB: 'primary-a-shape-b',
			clip: 'primary-a-clip',
			paint0: 'primary-a-paint-0',
			paint1: 'primary-a-paint-1',
			paint2: 'primary-a-paint-2',
			title: 'primary-a-title',
			description: 'primary-a-description'
		});
		expect(new Set([...Object.values(first), ...Object.values(second)]).size).toBe(16);
	});

	it('runs animation cleanup once even when destroy repeats', () => {
		const calls: string[] = [];
		const cleanup = createLandingHeroCleanup([
			() => calls.push('ticker'),
			() => calls.push('timeline'),
			() => calls.push('gradient')
		]);

		cleanup();
		cleanup();

		expect(calls).toEqual(['ticker', 'timeline', 'gradient']);
	});
});
