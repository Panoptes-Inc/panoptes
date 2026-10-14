<script lang="ts">
  import type { CompetitorAnalysisRadarPoint } from '../data/competitor-analysis-view-model';

  let { points = [] }: { points?: CompetitorAnalysisRadarPoint[] } = $props();

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function polarPoint(index: number, value: number, total: number): string {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    const radius = (value / 100) * 66;
    const x = 160 + Math.cos(angle) * radius;
    const y = 90 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }

  const benchmarkPolygonPoints = $derived(
    points.map((point, index) => polarPoint(index, clamp(point.value - 14, 0, 100), points.length)).join(' ')
  );
  const polygonPoints = $derived(points.map((point, index) => polarPoint(index, point.value, points.length)).join(' '));
</script>

<section class="radar-card">
  <h4>構造適合マップ</h4>

  <div class="radar-layout">
    <svg viewBox="0 0 320 180" aria-label="競合分析レーダーチャート">
      {#each [20, 40, 60, 80, 100] as level (level)}
        <polygon
          points={points.map((_, index) => polarPoint(index, level, points.length)).join(' ')}
          fill="none"
          stroke="#ece3da"
        />
      {/each}
      {#each points as _, index (index)}
        <line
          x1="160"
          y1="90"
          x2={polarPoint(index, 100, points.length).split(',')[0]}
          y2={polarPoint(index, 100, points.length).split(',')[1]}
          stroke="#ece3da"
        />
      {/each}

      <polygon points={benchmarkPolygonPoints} fill="rgba(125, 115, 255, 0.16)" stroke="#7d73ff" />
      <polygon points={polygonPoints} fill="rgba(255, 122, 26, 0.28)" stroke="#ff7a1a" />

      {#each points as point, index (index)}
        <text
          x={polarPoint(index, 160, points.length).split(',')[0]}
          y={polarPoint(index, 120, points.length).split(',')[1]}
          text-anchor="middle"
        >
          {point.label}
        </text>
      {/each}
    </svg>
  </div>
</section>

<style>
  .radar-card {
    border-radius: 8px;
    border: 1px solid #ece1d7;
    background: #fff;
    padding: 8px;
    display: flex;
    flex-flow: column;
    gap: 8px;
  }

  h4 {
    margin: 0;
    color: #4b4038;
    font-size: 14px;
  }

  .radar-layout {
    display: grid;
    place-items: center;
  }

  svg {
    width: 320px;
    height: 180px;
  }

  text {
    fill: #8b7f76;
    font-size: 12px;
  }
</style>
