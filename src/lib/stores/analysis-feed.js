import { writable } from 'svelte/store';

const INDUSTRY_POOL = [
  'デバッグ結果',
  '鉄鋼会社',
  'アパレル',
  '文房具',
  '転職',
  '人材派遣',
  'EC',
  'デザイン',
  '化粧品',
  'SaaS',
  '観光',
  '不動産',
  '食品D2C'
];

const COMPANY_PREFIX = ['株式会社', '合同会社', '有限会社'];
const COMPANY_CORE = ['YUU', 'Nova', 'Axis', 'Luna', 'Mira', 'Aster', 'Orion', 'Delta'];
const SERVICE_SUFFIX = ['サービス', 'プラットフォーム', 'アプリ', 'メディア', 'クラウド'];

export const industrySuggestions = writable([]);
export const analysisCards = writable([]);
export const suggestionsLoading = writable(false);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function buildTrendSeries(score) {
  const baseline = clamp(Math.round(score - randomInt(14, 24)), 20, 88);
  const avg = Array.from({ length: 5 }, () => clamp(baseline + randomInt(-4, 5), 15, 95));
  const inflow = avg.map((v) => clamp(v + randomInt(-7, 8), 15, 97));
  const outflow = avg.map((v) => clamp(v + randomInt(-8, 7), 15, 97));

  return [
    { name: '平均', values: avg },
    { name: '流入', values: inflow },
    { name: '流出', values: outflow }
  ];
}

function makeCard(industry, seed) {
  const score = randomInt(52, 94);
  const delta = randomInt(3, 18);
  const companyName = `${COMPANY_PREFIX[randomInt(0, COMPANY_PREFIX.length - 1)]}${COMPANY_CORE[randomInt(0, COMPANY_CORE.length - 1)]}`;
  const serviceName = `${industry}${SERVICE_SUFFIX[randomInt(0, SERVICE_SUFFIX.length - 1)]}`;

  return {
    id: `${industry}-${seed}-${Math.random().toString(36).slice(2, 8)}`,
    companyName,
    serviceName,
    score,
    industryAverageDelta: delta,
    industryPosition: `${industry}業界内でのポジションは中上位。強みは導線設計と訴求の一貫性。`,
    trendTitle: '流入流出変動',
    trendLegend: [
      { name: '平均', color: '#f2a16b' },
      { name: '流入', color: '#8a86f8' },
      { name: '流出', color: '#6e6b98' }
    ],
    trendSeries: buildTrendSeries(score),
    actions: {
      detail: { label: '詳細分析', href: `/app/analysis/${encodeURIComponent(industry.toLowerCase())}-${seed}` },
      competitors: { label: '競合訪問', href: `/app/search?industry=${encodeURIComponent(industry)}` }
    }
  };
}

function buildCardsFromSuggestions(suggestions) {
  const cards = suggestions.flatMap((industry) =>
    Array.from({ length: 5 }, (_, index) => makeCard(industry, index + 1))
  );

  return shuffle(cards);
}

async function simulateAISuggestions(keyword = '') {
  const normalized = keyword.trim();
  const fromPool = shuffle(INDUSTRY_POOL).slice(0, 6);

  if (normalized.length === 0) return fromPool;

  if (fromPool.includes(normalized)) return fromPool;

  return [normalized, ...fromPool.slice(0, 5)];
}

export async function refreshAISuggestions(keyword = '', options = {}) {
  const { clearExisting = false, skipDelay = false } = options;

  suggestionsLoading.set(true);
  if (clearExisting) {
    analysisCards.set([]);
  }

  if (!skipDelay) {
    await new Promise((resolve) => setTimeout(resolve, randomInt(220, 480)));
  }
  const suggestions = await simulateAISuggestions(keyword);

  industrySuggestions.set(suggestions);
  analysisCards.set(buildCardsFromSuggestions(suggestions));
  suggestionsLoading.set(false);

  return suggestions;
}


