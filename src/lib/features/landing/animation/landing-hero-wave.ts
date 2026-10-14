import { gsap } from 'gsap';

type Point = { x: number; y: number };

export type LandingHeroWaveIds = {
  shapeA: string;
  shapeB: string;
  paint2: string;
};

export type LandingHeroSvgIds = LandingHeroWaveIds & {
  clip: string;
  paint0: string;
  paint1: string;
  title: string;
  description: string;
};

export type LandingHeroWaveConfig = Readonly<{
  amplitude: number;
  waves: number;
  flowSpeed: number;
  pinPointWidth: number;
  introDuration: number;
  gradientOffset: number;
  gradientDuration: number;
}>;

export const LANDING_HERO_PRIMARY_WAVE_CONFIG: LandingHeroWaveConfig = Object.freeze({
  amplitude: 62,
  waves: 1.6,
  flowSpeed: 0.4,
  pinPointWidth: 0.06,
  introDuration: 1.4,
  gradientOffset: 300,
  gradientDuration: 6
});

export const LANDING_HERO_SECONDARY_WAVE_CONFIG: LandingHeroWaveConfig = Object.freeze({
  amplitude: 62,
  waves: 1.6,
  flowSpeed: 0.4,
  pinPointWidth: 0.06,
  introDuration: 1.4,
  gradientOffset: 300,
  gradientDuration: 6
});

export type LandingHeroWaveOptions = {
  t: number;
  amp?: number;
  waves?: number;
  flowSpeed?: number;
  pinPointWidth?: number;
};

export function smoothstep01(value: number): number {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const b0 = u * u * u;
  const b1 = 3 * u * u * t;
  const b2 = 3 * u * t * t;
  const b3 = t * t * t;
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y
  };
}

function catmullRomToBezier(points: Point[], tension = 1): string {
  if (points.length < 2) return '';
  const commands: string[] = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    commands.push(
      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }
  return commands.join(' ');
}

function edgeGate(u: number, edgeWidth = 0.06): number {
  return smoothstep01((1 - u) / edgeWidth);
}

function rightDamp(u: number, strength = 0.55): number {
  return strength + (1 - strength) * u;
}

export function buildLandingHeroBoundary(options: LandingHeroWaveOptions): string {
  const { t, amp = 62, waves = 1.6, flowSpeed = 0.9, pinPointWidth = 0.06 } = options;
  const controlPoints: Point[] = [
    { x: 1980, y: 1168 },
    { x: 1550, y: 1120 },
    { x: 1220, y: 960 },
    { x: 1000, y: 800 },
    { x: 820, y: 680 },
    { x: 520, y: 420 },
    { x: 0, y: 0 }
  ];
  const points: Point[] = [];
  const pointCount = 30;
  const twoPi = Math.PI * 2;

  for (let index = 0; index < pointCount; index += 1) {
    const u = index / (pointCount - 1);
    const base =
      u < 0.5
        ? cubicBezier(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3], u / 0.5)
        : cubicBezier(
            controlPoints[3],
            controlPoints[4],
            controlPoints[5],
            controlPoints[6],
            (u - 0.5) / 0.5
          );
    const phase = twoPi * waves * (1 - u) - flowSpeed * t;
    const wave = Math.sin(phase) * amp * edgeGate(u, pinPointWidth) * rightDamp(u, 0.1);
    points.push({ x: base.x + wave * 0.1, y: base.y + wave });
  }

  points[points.length - 1] = { x: 0, y: 0 };
  return catmullRomToBezier(points, 1.22);
}

export function buildLandingHeroShape(variant: 'A' | 'B', boundary: string): string {
  const head =
    variant === 'A'
      ? 'M1 0 V1100 C1000 1200 1000 1188 1980 1168'
      : 'M1 0 V1100 C1000 1300 1180 1000 1980 1168';
  return `${head} ${boundary} Z`;
}

export function createLandingHeroSvgIds(instanceId: string): LandingHeroSvgIds {
  return {
    shapeA: `${instanceId}-shape-a`,
    shapeB: `${instanceId}-shape-b`,
    clip: `${instanceId}-clip`,
    paint0: `${instanceId}-paint-0`,
    paint1: `${instanceId}-paint-1`,
    paint2: `${instanceId}-paint-2`,
    title: `${instanceId}-title`,
    description: `${instanceId}-description`
  };
}

export function createLandingHeroCleanup(cleanups: Array<() => void>): () => void {
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    for (const cleanup of cleanups) cleanup();
  };
}

export function mountLandingHeroWaveAnimation(
  svgElement: SVGSVGElement,
  ids: LandingHeroWaveIds,
  config: LandingHeroWaveConfig
): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;

  const timeline = gsap.timeline();
  timeline.from(
    svgElement.querySelectorAll('.hero-text01 tspan'),
    { opacity: 0, y: 20, stagger: 0.05, duration: config.introDuration, ease: 'power3.out' },
    0
  );
  timeline.from(
    svgElement.querySelectorAll('.hero-text02 tspan'),
    { opacity: 0, y: 20, stagger: 0.05, duration: config.introDuration, ease: 'power3.out' },
    0
  );

  const state = { t: 0 };
  const tick = () => {
    state.t += gsap.ticker.deltaRatio() / 60;
    const shapeA = svgElement.querySelector(`#${ids.shapeA}`);
    const shapeB = svgElement.querySelector(`#${ids.shapeB}`);
    if (!shapeA || !shapeB) return;
    const boundary = buildLandingHeroBoundary({
      t: state.t,
      amp: config.amplitude,
      waves: config.waves,
      flowSpeed: config.flowSpeed,
      pinPointWidth: config.pinPointWidth
    });
    shapeA.setAttribute('d', buildLandingHeroShape('A', boundary));
    shapeB.setAttribute('d', buildLandingHeroShape('B', boundary));
  };
  gsap.ticker.add(tick);

  const gradient = svgElement.querySelector(`#${ids.paint2}`);
  const gradientTween = gradient
    ? gsap.to(gradient, {
        attr: { gradientTransform: `translate(${config.gradientOffset} 0)` },
        duration: config.gradientDuration,
        ease: 'none',
        repeat: -1,
        yoyo: true
      })
    : null;

  return createLandingHeroCleanup([
    () => gsap.ticker.remove(tick),
    () => timeline.kill(),
    () => gradientTween?.kill()
  ]);
}
