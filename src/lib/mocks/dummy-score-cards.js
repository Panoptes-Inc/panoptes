function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function pad2(value) {
  return String(Math.round(value)).padStart(2, '0');
}

const COMPANY_CORE = ['YUU', 'Nova', 'Axis', 'Luna', 'Mira', 'Aster'];
const SERVICE_CORE = ['EC', 'SaaS', 'D2C', '人材', '旅行', '金融'];

const TAG_POOL = ['導線', '訴求', 'LTV', 'SEO', 'CVR', 'UX'];

const TREND_LEGEND = [
  { name: '業界平均', color: '#f2a16b' },
  { name: '流入', color: '#8a86f8' },
  { name: '流出', color: '#6e6b98' }
];

const TREND_SERIES_POOL = [
  [
    [52, 54, 53, 55, 54],
    [53, 51, 54, 56, 55],
    [50, 52, 56, 54, 53]
  ],
  [
    [55, 56, 54, 57, 56],
    [58, 56, 57, 59, 58],
    [49, 50, 52, 51, 50]
  ],
  [
    [49, 51, 50, 52, 51],
    [54, 53, 55, 56, 57],
    [47, 49, 48, 50, 49]
  ]
];

export const DUMMY_TOP_LOOP_COPY = {
  loading: 'AI提案を読み込み中...',
  empty: 'カードがありません。業界を選んで分析を実行してください。'
};

export function createDummyScoreCards(
  count = 8,
  { idPrefix = 'dummy', detailHref = '#', competitorHref = '#' } = {}
) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const trendPreset = TREND_SERIES_POOL[index % TREND_SERIES_POOL.length];
    return {
      id: `${idPrefix}-${index + 1}`,
      companyName: `株式会社${COMPANY_CORE[index % COMPANY_CORE.length]}`,
      serviceName: `${SERVICE_CORE[index % SERVICE_CORE.length]}サービス`,
      score: 61 + ((index * 7) % 31),
      industryAverageDelta: 4 + (index % 14),
      industryPosition:
        '業界内でのポジションは中位。強みは導線設計と訴求の一貫性です。',
      trendTitle: '流入 / 流出トレンド',
      trendLegend: TREND_LEGEND,
      trendSeries: [
        { name: '業界平均', values: trendPreset[0] },
        { name: '流入', values: trendPreset[1] },
        { name: '流出', values: trendPreset[2] }
      ],
      actions: {
        detail: { label: '詳細を見る', href: detailHref },
        competitors: { label: '競合を見る', href: competitorHref }
      }
    };
  });
}

export const DEFAULT_DUMMY_SCORE_CARD = createDummyScoreCards(1, { idPrefix: 'dummy-default' })[0];

function buildTags(card, index) {
  const serviceSeed = String(card.serviceName ?? '')
    .replace('サービス', '')
    .replace(' Service', '')
    .trim();

  return [
    `# ${serviceSeed || '分析'}`,
    `# ${TAG_POOL[index % TAG_POOL.length]}`,
    `# ${TAG_POOL[(index + 2) % TAG_POOL.length]}`
  ];
}

function buildMetricBreakdown(card, index) {
  const series = Array.isArray(card.trendSeries) ? card.trendSeries : [];
  const inflowLast = Number(series[1]?.values?.[series[1]?.values.length - 1] ?? 0);
  const outflowLast = Number(series[2]?.values?.[series[2]?.values.length - 1] ?? 0);
  const score = clamp(Number(card.score) || 0, 0, 100);

  const structural = clamp(Math.round(score * 0.84), 0, 99);
  const stay = clamp(Math.round(score * 0.76), 0, 99);
  const seo = clamp(Math.round(score * 0.68 + (index % 7)), 0, 99);

  return [
    { label: '流入', value: pad2(inflowLast), color: '#f28d55' },
    { label: '流出', value: pad2(outflowLast), color: '#8a86f8' },
    { label: '構造', value: pad2(structural), color: '#6f6f99' },
    { label: '滞在時間', value: pad2(stay), color: '#706ea3' },
    { label: 'SEO', value: pad2(seo), color: '#666699' }
  ];
}

export function toDetailedDummyCard(card, index) {
  const score = clamp(Number(card.score) || 0, 0, 100);
  const industryAverageDelta = Math.max(0, Number(card.industryAverageDelta) || 0);
  const stayAverageDelta = Math.max(0, Math.max(3, Math.round(score / 9)));

  return {
    ...card,
    score,
    industryAverageDelta,
    industryAverageRank: clamp(Math.max(9, 42 - industryAverageDelta), 5, 99),
    stayAverageDelta,
    stayAverageRank: clamp(Math.max(8, 40 - stayAverageDelta), 5, 99),
    stayAverageUnit: '秒',
    tags: buildTags(card, index),
    metricBreakdown: buildMetricBreakdown(card, index),
    genderRatio: {
      female: clamp(42 + ((index * 7) % 20), 28, 62),
      male: clamp(58 - ((index * 3) % 16), 38, 72)
    },
    overallRating: String(card.industryPosition ?? '')
  };
}

export function createDetailedDummyScoreCards(count = 10, options = {}) {
  return createDummyScoreCards(count, options).map((card, index) => toDetailedDummyCard(card, index));
}
