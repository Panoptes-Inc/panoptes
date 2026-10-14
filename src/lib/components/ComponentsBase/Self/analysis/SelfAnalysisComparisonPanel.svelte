<script lang="ts">
  import type { SelfAnalysisMetricRow } from '../data/self-analysis-view-model';

  let {
    metricRows = [],
    radar = []
  }: {
    metricRows?: SelfAnalysisMetricRow[];
    radar?: Array<{ label: string; self: number; industry: number }>;
  } = $props();

  function polarPoint(index: number, value: number, total: number): string {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    const radius = (value / 100) * 92;
    const x = 160 + Math.cos(angle) * radius;
    const y = 160 + Math.sin(angle) * radius;
    return `${x},${y}`;
  }

  const selfPolygon = $derived(radar.map((item, index) => polarPoint(index, item.self, radar.length)).join(' '));
  const industryPolygon = $derived(
    radar.map((item, index) => polarPoint(index, item.industry, radar.length)).join(' ')
  );
</script>

<section class="self-analysis-comparison-panel">
  <div class="metric-column">
    <header>
      <h2>自社スコア比較</h2>
      <p>内部構造と見た目品質を、業界平均と並べて確認します。</p>
    </header>

    <div class="metric-list">
      {#each metricRows as row, index (index)}
        <article class="metric-row">
          <div class="metric-label-row">
            <strong>{row.label}</strong>
            <span>{row.selfScore} : {row.benchmarkScore}</span>
          </div>

          <div class="metric-bars">
            <div class="bar-track"><div class="bar-fill self" style:width={`${row.selfScore}%`}></div></div>
            <div class="bar-track"><div class="bar-fill benchmark" style:width={`${row.benchmarkScore}%`}></div></div>
          </div>
        </article>
      {/each}
    </div>
  </div>

  <div class="radar-column">
    <header>
      <h2>6軸レーダー</h2>
      <p>自社と業界平均の差分が一目で分かります。</p>
    </header>

    {#if radar.length}
      <svg viewBox="0 0 320 320" aria-label="自社と業界平均のレーダーチャート">
        <title>自社と業界平均の6軸レーダーチャート</title>
        {#each [20, 40, 60, 80, 100] as level (level)}
          <polygon
            points={radar.map((_, index) => polarPoint(index, level, radar.length)).join(' ')}
            fill="none"
            stroke="#e8ddd5"
          />
        {/each}

        {#each radar as _, index (index)}
          <line
            x1="160"
            y1="160"
            x2={polarPoint(index, 100, radar.length).split(',')[0]}
            y2={polarPoint(index, 100, radar.length).split(',')[1]}
            stroke="#e8ddd5"
          />
        {/each}

        <polygon points={industryPolygon} fill="rgba(141, 134, 255, 0.16)" stroke="#8d86ff" />
        <polygon points={selfPolygon} fill="rgba(255, 159, 99, 0.32)" stroke="#ff8d42" />

        {#each radar as item, index (index)}
          <text
            x={polarPoint(index, 140, radar.length).split(',')[0]}
            y={polarPoint(index, 120, radar.length).split(',')[1]}
            text-anchor="middle"
          >
            {item.label}
          </text>
        {/each}
      </svg>
    {/if}
  </div>
</section>

<style>
  .self-analysis-comparison-panel {
    width: 100%;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 0 4px #00000016;
    padding: 8px;
    display: flex;
    gap: 18px;
    flex: 1 1 auto;
    min-height: 0;
  }

  .metric-column {
    display: flex;
    gap: 8px;
    flex-flow: column;
    align-content: start;
    flex: 0.7;
  }

  .metric-column header {
    display: flex;
    gap: 8px;
    flex-flow: row;
    align-items: center;
  }

  .radar-column header {
    display: flex;
    gap: 8px;
    flex-flow: row;
    align-items: center;
  }

  .radar-column {
    display: grid;
    gap: 12px;
    align-content: start;
    flex: 0.3;
  }

  h2,
  p,
  strong,
  span {
    margin: 0;
  }

  h2 {
    color: #473932;
    font-size: 16px;
  }

  header p {
    color: #85776e;
    font-size: 12px;
  }

  .metric-list {
    display: grid;
    gap: 8px;
  }

  .metric-row {
    display: grid;
    gap: 7px;
  }

  .metric-label-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
  }

  .metric-label-row strong {
    color: #574940;
    font-size: 13px;
  }

  .metric-label-row span {
    color: #8b7c71;
    font-size: 12px;
  }

  .metric-bars {
    display: grid;
    gap: 6px;
  }

  .bar-track {
    height: 6px;
    border-radius: 999px;
    background: #f1e6dd;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: inherit;
  }

  .bar-fill.self {
    background: linear-gradient(90deg, #ffb481, #ff6d1d);
  }

  .bar-fill.benchmark {
    background: linear-gradient(90deg, #d7d3ff, #8d86ff);
  }

  svg {
    width: 100%;
    max-width: 320px;
    justify-self: center;
  }

  text {
    fill: #8b7c71;
    font-size: 12px;
  }

  @media (max-width: 1220px) {
    .self-analysis-comparison-panel {
      grid-template-columns: 1fr;
    }
  }
</style>
