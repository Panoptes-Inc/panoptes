<script lang="ts">
  import { onMount } from 'svelte';
  import {
    createLandingHeroSvgIds,
    LANDING_HERO_PRIMARY_WAVE_CONFIG,
    mountLandingHeroWaveAnimation
  } from '../animation/landing-hero-wave';

  const instanceId = $props.id();
  const ids = createLandingHeroSvgIds(instanceId);
  let svgElement: SVGSVGElement;

  onMount(() =>
    mountLandingHeroWaveAnimation(svgElement, ids, LANDING_HERO_PRIMARY_WAVE_CONFIG)
  );
</script>

<svg
  bind:this={svgElement}
  class="hero-section-left"
  viewBox="0 0 1980 1200"
  preserveAspectRatio="xMinYMin meet"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-labelledby={`${ids.title} ${ids.description}`}
>
  <title id={ids.title}>Panoptesで市場を見る</title>
  <desc id={ids.description}>数日かかっていた市場調査を数秒に短縮し、意思決定を加速するPanoptesの紹介</desc>
  <defs>
    <path
      id={ids.shapeA}
      d="
        M1 0
        V1100
        C1000 1200 1000 1188 1980 1168
        C1840 1140 1760 1120 1700 1090
        C1640 1060 1580 1076 1520 1046
        C1460 1016 1400 1032 1340 1002
        C1280 972 1220 988 1160 958
        C1100 928 1060 880 1000 800
        C720 650 475 380 345 250
        C220 100 0 0 0 0
        Z
      "
    />

    <path
      id={ids.shapeB}
      d="
        M1 0
        V1100
        C1000 1300 1180 1000 1980 1168
        C1840 1140 1760 1120 1700 1090
        C1640 1060 1580 1076 1520 1046
        C1460 1016 1400 1032 1340 1002
        C1280 972 1220 988 1160 958
        C1100 928 1060 880 1000 800
        C720 650 475 380 345 250
        C220 100 0 0 0 0
        Z
      "
    />

    <clipPath id={ids.clip}>
      <use href={`#${ids.shapeB}`} />
    </clipPath>

    <linearGradient
      id={ids.paint0}
      x1="992.656"
      y1="6.08263e-05"
      x2="992.072"
      y2="1187.66"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#BD4B05" />
      <stop offset="1" stop-color="#0C00B3" />
    </linearGradient>

    <linearGradient
      id={ids.paint1}
      x1="0%"
      x2="100%"
      y1="0%"
      y2="100%"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stop-color="#1100FF" />
      <stop offset="100%" stop-color="#FF6200" />
    </linearGradient>

    <linearGradient
      id={ids.paint2}
      x1="0%"
      x2="100%"
      y1="0%"
      y2="100%"
      gradientUnits="userSpaceOnUse"
      gradientTransform="translate(0 0)"
    >
      <stop offset="0%" stop-color="#FF6200" />
      <stop offset="20%" stop-color="#FFA268" />
      <stop offset="100%" stop-color="#FF6200" />
    </linearGradient>
  </defs>

  <text
    class="hero-text01"
    fill={`url(#${ids.paint2})`}
    text-anchor="start"
    dominant-baseline="hanging"
  >
    <tspan x="4%" dy="0" textLength="auto" lengthAdjust="spacing">
      <tspan>P</tspan><tspan>a</tspan><tspan>n</tspan><tspan>o</tspan><tspan>p</tspan
      ><tspan>t</tspan><tspan>e</tspan><tspan>s</tspan><tspan>.</tspan>
    </tspan>
    <tspan x="4%" dy="1.2em" textLength="auto" lengthAdjust="spacing">
      <tspan>S</tspan><tspan>e</tspan><tspan>e</tspan> <tspan>t</tspan><tspan>h</tspan
      ><tspan>e</tspan> <tspan>u</tspan><tspan>n</tspan><tspan>s</tspan><tspan>e</tspan
      ><tspan>e</tspan><tspan>n</tspan><tspan>.</tspan>
    </tspan>
  </text>

  <use href={`#${ids.shapeA}`} fill={`url(#${ids.paint0})`} />
  <use href={`#${ids.shapeB}`} fill={`url(#${ids.paint1})`} />

  <text
    class="hero-text02"
    fill="currentColor"
    text-anchor="start"
    dominant-baseline="hanging"
    lengthAdjust="spacing"
    clip-path={`url(#${ids.clip})`}
  >
    <tspan x="4%" dy="0" textLength="auto" lengthAdjust="spacing">
      <tspan>P</tspan><tspan>a</tspan><tspan>n</tspan><tspan>o</tspan><tspan>p</tspan
      ><tspan>t</tspan><tspan>e</tspan><tspan>s</tspan><tspan>.</tspan>
    </tspan>
    <tspan x="4%" dy="1.2em" textLength="auto" lengthAdjust="spacing">
      <tspan>S</tspan><tspan>e</tspan><tspan>e</tspan> <tspan>t</tspan><tspan>h</tspan
      ><tspan>e</tspan> <tspan>u</tspan><tspan>n</tspan><tspan>s</tspan><tspan>e</tspan
      ><tspan>e</tspan><tspan>n</tspan><tspan>.</tspan>
    </tspan>
  </text>

  <text
    class="hero-text03"
    x="4%"
    y="50%"
    fill="currentColor"
    text-anchor="start"
    dominant-baseline="hanging"
    lengthAdjust="spacing"
    clip-path={`url(#${ids.clip})`}
  >
    <tspan x="4%" dy="0" textLength="auto" lengthAdjust="spacing">市場を”読む”を辞め</tspan>
    <tspan x="4%" dy="1.6em" textLength="auto" lengthAdjust="spacing">市場を”見る”時代へ</tspan>
  </text>

  <text
    class="hero-text04"
    x="4%"
    y="62%"
    fill="currentColor"
    text-anchor="start"
    dominant-baseline="hanging"
    lengthAdjust="spacing"
    clip-path={`url(#${ids.clip})`}
  >
    <tspan x="4%" dy="0" textLength="auto" lengthAdjust="spacing">これまで数日かかっていた</tspan>
    <tspan x="4%" dy="2.4em" textLength="auto" lengthAdjust="spacing">市場調査を、数秒で。</tspan>
    <tspan x="4%" dy="2.4em" textLength="auto" lengthAdjust="spacing">
      Panoptes は、あなたの意思決定を
    </tspan>
    <tspan x="4%" dy="2.4em" textLength="auto" lengthAdjust="spacing">圧倒的に加速させます。</tspan>
  </text>
</svg>

<style>
  .hero-section-left {
    width: 100%;
  }

  .hero-text01,
  .hero-text02 tspan {
    font-size: 240px;
    font-weight: 700;
  }

  .hero-text02 {
    color: white;
  }

  .hero-text03 {
    font-size: 40px;
    font-weight: 500;
    color: white;
  }

  .hero-text04 {
    font-size: 24px;
    font-weight: 300;
    color: white;
  }

  .hero-text03,
  .hero-text04 {
    letter-spacing: 0.1em;
  }
</style>
