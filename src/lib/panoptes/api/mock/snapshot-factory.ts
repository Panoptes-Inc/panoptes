import type {
  IsoDateString,
  PanoptesAnalysisSnapshotPayload,
  PanoptesInferenceDraft,
  PanoptesPhaseTask,
  PanoptesPhaseTaskStatus,
  PanoptesProjectRecord,
  PanoptesStrategyPlan,
  Uuid
} from '../../types';

export type SnapshotFactoryDependencies = {
  createUuid: (prefix?: string) => Uuid;
  hashString: (source: string) => number;
  hostFromUrl: (targetUrl: string) => string;
  nowIso: () => IsoDateString;
  pickBySeed: <T>(seed: number, items: T[], offset?: number) => T;
  seededRange: (seed: number, min: number, max: number, offset?: number) => number;
  titleFromHost: (host: string) => string;
};

export type SnapshotFactoryBuildOptions = {
  analysisSnapshotId?: Uuid;
  strategyPlans?: PanoptesStrategyPlan[];
  phaseTasks?: PanoptesPhaseTask[];
  overrides?: Partial<PanoptesAnalysisSnapshotPayload>;
};

export type DeterministicSnapshotFactoryOptions = {
  fixedSnapshotId?: Uuid;
  nowIso?: IsoDateString;
  seedKey?: string;
};

export function createDeterministicSnapshotFactoryDependencies(
  options: DeterministicSnapshotFactoryOptions = {}
): SnapshotFactoryDependencies {
  const stableNowIso = options.nowIso ?? '2026-01-01T00:00:00.000Z';
  const stableSeedKey = options.seedKey ?? 'panoptes-dummy';
  let issuedCount = 0;
  let snapshotIssued = false;

  function hashString(source: string): number {
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  function seededRange(seed: number, min: number, max: number, offset = 0): number {
    const span = max - min + 1;
    return min + ((seed + offset * 13) % span);
  }

  function pickBySeed<T>(seed: number, items: T[], offset = 0): T {
    return items[(seed + offset * 11) % items.length]!;
  }

  function hostFromUrl(targetUrl: string): string {
    try {
      return new URL(targetUrl).hostname.replace(/^www\./, '');
    } catch {
      return targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
    }
  }

  function titleFromHost(host: string): string {
    return (
      host
        .split('.')
        .shift()
        ?.split(/[-_]/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ') || 'Panoptes Project'
    );
  }

  function createUuid(prefix = 'mock'): Uuid {
    if (prefix === 'snapshot' && options.fixedSnapshotId && !snapshotIssued) {
      snapshotIssued = true;
      return options.fixedSnapshotId;
    }

    issuedCount += 1;
    const suffix = hashString(`${stableSeedKey}:${prefix}:${issuedCount}`).toString(36);
    return `${prefix}_${suffix}`;
  }

  return {
    createUuid,
    hashString,
    hostFromUrl,
    nowIso: () => stableNowIso,
    pickBySeed,
    seededRange,
    titleFromHost
  };
}

function createStrategyArtifacts(
  seed: number,
  analysisSnapshotId: Uuid,
  deps: SnapshotFactoryDependencies
): { strategyPlans: PanoptesStrategyPlan[]; phaseTasks: PanoptesPhaseTask[] } {
  const { createUuid, nowIso, pickBySeed, seededRange } = deps;
  const timestamp = nowIso();
  const strategyPlans: PanoptesStrategyPlan[] = [
    {
      strategyPlanId: createUuid('plan'),
      analysisSnapshotId,
      strategyKey: 'rebuild_comparison',
      title: '比較導線の再設計',
      summary: '比較ページから主要 CTA までの流れを整え、検討離脱を抑えるプランです。',
      fitScore: seededRange(seed, 78, 90, 1),
      priorityRank: 1,
      isSelected: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      strategyPlanId: createUuid('plan'),
      analysisSnapshotId,
      strategyKey: 'trust_stack',
      title: '信頼訴求の積み上げ',
      summary: '導入実績、FAQ、レビューの見せ方を整え、不安を先回りして解消するプランです。',
      fitScore: seededRange(seed, 70, 84, 2),
      priorityRank: 2,
      isSelected: false,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      strategyPlanId: createUuid('plan'),
      analysisSnapshotId,
      strategyKey: 'message_focus',
      title: '差別化メッセージの明確化',
      summary: '抽象的な訴求を整理し、比較検討時に残る言葉へ置き換えるプランです。',
      fitScore: seededRange(seed, 68, 82, 3),
      priorityRank: 3,
      isSelected: false,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  const phaseDefinitions = [
    {
      phaseCode: 'day_30' as const,
      titles: ['CTA 設計の見直し', '比較ページ構成の再設計', '料金ページ要約の整理']
    },
    {
      phaseCode: 'day_60' as const,
      titles: ['FAQ の再構成', '導入事例の拡充', '信頼要素の固定表示']
    },
    {
      phaseCode: 'day_90' as const,
      titles: ['差別化メッセージ刷新', '比較軸の言語化', 'ヒーローエリア再設計']
    }
  ];

  const phaseTasks: PanoptesPhaseTask[] = [];
  phaseDefinitions.forEach((definition, phaseIndex) => {
    definition.titles.forEach((title, taskIndex) => {
      const statusPool: PanoptesPhaseTaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];
      phaseTasks.push({
        phaseTaskId: createUuid('task'),
        strategyPlanId: strategyPlans[0]!.strategyPlanId,
        phaseCode: definition.phaseCode,
        title,
        description: `${definition.phaseCode} に進める主要タスクです。`,
        sortOrder: taskIndex + 1,
        taskStatus: pickBySeed(seed + phaseIndex * 3 + taskIndex, statusPool),
        ownerLabel: pickBySeed(seed + taskIndex, ['PM', 'Marketing', 'Design', 'Sales']),
        dueHint: `D+${(phaseIndex + 1) * 15 + taskIndex * 5}`,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    });
  });

  return { strategyPlans, phaseTasks };
}

export function buildMockSnapshotPayload(
  project: PanoptesProjectRecord,
  draft: PanoptesInferenceDraft,
  deps: SnapshotFactoryDependencies,
  options: SnapshotFactoryBuildOptions = {}
): PanoptesAnalysisSnapshotPayload {
  const { createUuid, hashString, hostFromUrl, nowIso, pickBySeed, seededRange, titleFromHost } = deps;
  const seed = hashString(`${project.targetUrl}-${draft.inferredIndustry}-${draft.inferredStructureType}`);
  const analysisSnapshotId = options.analysisSnapshotId ?? createUuid('snapshot');
  const strategyArtifacts =
    options.strategyPlans && options.phaseTasks ? null : createStrategyArtifacts(seed, analysisSnapshotId, deps);
  const strategyPlans = options.strategyPlans ?? strategyArtifacts!.strategyPlans;
  const phaseTasks = options.phaseTasks ?? strategyArtifacts!.phaseTasks;
  const host = hostFromUrl(project.targetUrl);
  const siteName = titleFromHost(host);

  const competitors = Array.from({ length: 10 }, (_, index) => ({
    competitorId: createUuid('competitor'),
    companyName: `${pickBySeed(seed + index, ['Axis', 'Nova', 'Mira', 'Luna', 'Aster'])} ${pickBySeed(seed, ['Cloud', 'Works', 'Lab', 'Shift'])}`,
    serviceName: `${draft.inferredIndustry} ${pickBySeed(seed + index, ['Platform', 'Suite', 'Hub', 'Studio'])}`,
    url: `https://${pickBySeed(seed + index, ['axis', 'nova', 'mira', 'luna'])}.example.com`,
    marketTypeLabel: draft.inferredStructureType,
    internalStructureScore: seededRange(seed, 68, 88, index),
    visualScore: seededRange(seed, 62, 84, index + 4),
    overallScore: seededRange(seed, 70, 90, index + 7),
    fitReason: `${draft.inferredIndustry} 領域で比較検討時に並びやすい競合です。`,
    tags: [`# ${draft.inferredIndustry}`, '# 比較検討', '# 信頼補強'],
    insightLines: ['比較導線が明快', '価値訴求が一貫', '信頼情報の配置が強い'],
    actionBullets: ['比較表現の差別化', 'CTA 文言の再設計', '実績導線の明確化'],
    detailSummary: '競合上位は比較設計と信頼補強の積み上げが強く、比較表現の切り口も明確です。'
  }));

  const defaultSnapshot: PanoptesAnalysisSnapshotPayload = {
    analysisSnapshotId,
    projectId: project.projectId,
    versionLabel: `v${seededRange(seed, 2, 8)}`,
    analyzedAt: nowIso(),
    siteName,
    meta: {
      tokenUsageRate: seededRange(seed, 52, 79),
      memoryLabel: '記憶稼働中',
      projectDayCount: seededRange(seed, 18, 38),
      analyzedDateLabel: nowIso().slice(0, 10)
    },
    competitors: {
      summaryTitle: `${draft.inferredIndustry} の主要競合`,
      summaryText: '競合カードは同一 snapshot を参照し、比較軸と強みの揺れを防ぎます。',
      cards: competitors
    },
    industry: {
      analyzedAt: nowIso().slice(0, 10).replace(/-/g, '.'),
      signals: ['# 分散競争市場', '# 成熟安定市場', '# 比較検討主導', '# 信頼補強重視'],
      marketType: {
        typeLabel: draft.inferredStructureType,
        confidence: seededRange(seed, 82, 91),
        description: '情報整理だけでは差がつきにくく、比較設計と信頼訴求の積み上げが勝敗を分ける市場です。',
        detail: '導線、比較、信頼の 3 点を同時に整えると、競合との差が出やすい状態です。'
      },
      rating: {
        metrics: [
          { label: '価値訴求平均', value: seededRange(seed, 70, 84), tone: 'orange' },
          { label: '信頼構造平均', value: seededRange(seed, 74, 88), tone: 'orange' },
          { label: '情報階層平均', value: seededRange(seed, 58, 72), tone: 'violet' },
          { label: '差別化明確性平均', value: seededRange(seed, 56, 70), tone: 'violet' },
          { label: '導線強度平均', value: seededRange(seed, 60, 76), tone: 'orange-soft' },
          { label: '意思決定支援平均', value: seededRange(seed, 68, 82), tone: 'orange-soft' }
        ],
        highlights: [
          {
            title: '構造安定度',
            accent: '構造安定度: 高',
            body: '上位企業の比較導線が収束しており、勝ち筋が比較的明確です。'
          },
          {
            title: '差別化余白',
            accent: '差別化余白: 大',
            body: '同質的な訴求が多く、言語化を研ぎ直す余地があります。'
          }
        ],
        insight: {
          label: 'AI 評価',
          paragraphs: [
            '比較設計と信頼補強の積み上げが勝敗に強く影響します。',
            '一方で、差別化メッセージは全体に弱く、似た訴求が並びやすい状態です。',
            '比較検討フェーズを整えつつ、価値の言語化を明確にするのが分岐点です。'
          ]
        }
      },
      position: {
        pressureLabel: '市場競争圧: Low',
        cards: [
          { title: '自社ポジション', lines: ['現在位置: 挑戦者', `戦略適合指数: ${seededRange(seed, 72, 86)}`, '業界平均との差: -4'] },
          { title: '先行帯との差', lines: ['先行帯平均との差: +9', '追い抜き対象: 2 社', '現在の到達余地: 中'] }
        ],
        matrix: {
          pointLabel: '挑戦帯',
          pointX: 0.74,
          pointY: 0.31,
          xAxisLabels: ['平均帯', '先行帯'],
          yAxisLabels: ['平均帯', '構造優位']
        },
        insight: {
          label: 'AI 評価',
          paragraphs: ['比較フェーズ設計を改善すると、先行帯に入る余地が広がります。']
        }
      },
      distribution: {
        primary: {
          title: '平均優位型',
          subLabel: '平均型',
          value: seededRange(seed, 44, 58),
          descriptor: '業界性格',
          descriptorText: '中程度の競争市場',
          color: '#ff6a00'
        },
        secondary: [
          { title: '構造優位', value: seededRange(seed, 16, 26), color: '#ffb06c' },
          { title: '訴求特化', value: seededRange(seed, 22, 34), color: '#ffd2b1' }
        ],
        stats: [
          { label: '集中度指数', value: `${(seededRange(seed, 46, 72) / 100).toFixed(2)}` },
          { label: '優位企業比率', value: `${seededRange(seed, 16, 28)}%` },
          { label: '型のばらつき', value: pickBySeed(seed, ['小', '中', '中', '高']) }
        ],
        leaders: ['構造優位 2 社', '訴求特化型 3 社', '平均型 5 社'],
        insight: {
          label: 'AI 評価',
          paragraphs: ['比較導線、信頼補強、訴求整理の 3 点を整えると抜けやすい市場です。']
        }
      },
      opportunity: {
        lanes: [
          {
            title: '比較導線の余白',
            reason: 'CTA と比較ページ接続に余白があります。',
            gaps: ['比較軸不足', 'CTA 一貫性不足', '料金導線弱い'],
            actions: ['比較導線再設計', '比較軸コピー追加', '料金ページ要約化']
          },
          {
            title: '信頼訴求の余白',
            reason: '実績、FAQ、レビューの積み上げが弱い状態です。',
            gaps: ['実績不足', 'FAQ 不足', 'レビュー不足'],
            actions: ['導入実績整理', 'FAQ 再構成', 'レビュー導線固定']
          },
          {
            title: '差別化言語化の余白',
            reason: '抽象訴求が多く、比較軸で残りづらい状態です。',
            gaps: ['抽象コピー偏重', '理由弱い', '見出し埋もれる'],
            actions: ['価値訴求再定義', '差別化証拠明文化', 'ヒーロー刷新']
          }
        ],
        summary: {
          battlefields: ['比較導線', '信頼補強', '差別化言語化'],
          priorities: ['比較導線の再設計', '導入実績の整理', '差別化コピー刷新']
        },
        insight: {
          label: 'AI 評価',
          paragraphs: ['比較導線と差別化表現の 2 点を深く詰める方が勝ちやすい状態です。']
        }
      }
    },
    self: {
      overallScore: seededRange(seed, 72, 84),
      typeLabel: draft.inferredStructureType,
      structureScore: seededRange(seed, 72, 82, 3),
      visualScore: seededRange(seed, 64, 76, 5),
      gapBadges: ['信頼補強 -12', '導線強度 -10', '情報階層 +8', '意思決定支援 -6'],
      radar: [
        { label: '情報階層', self: 76, industry: 68 },
        { label: '導線強度', self: 72, industry: 80 },
        { label: '差別化指数', self: 61, industry: 68 },
        { label: '意思決定', self: 66, industry: 72 },
        { label: '信頼根拠', self: 70, industry: 78 },
        { label: '価値訴求', self: 74, industry: 70 }
      ],
      strengths: ['情報階層が整理されている', 'ブランド印象が一定している', '主要 CTA の位置が明確'],
      issues: ['比較導線が弱い', '事例訴求の厚みが不足', '差別化理由が抽象的'],
      breakdown: [
        { label: '情報設計', score: 78, finding: '階層は整理されている' },
        { label: '訴求一貫性', score: 70, finding: 'ページ間で若干ブレがある' },
        { label: '回遊設計', score: 65, finding: '関連リンクが不足' },
        { label: '技術基盤', score: 75, finding: 'canonical / OGP は適切' }
      ],
      aiSummary: ['価値訴求は一定水準です。', '比較導線と信頼補強が弱く、検討フェーズで取りこぼしが起きやすい状態です。'],
      actionCards: [
        {
          title: '主要ページ導線評価',
          rationale: '比較検討フェーズへ繋がる導線が弱い状態です。',
          impact: '導線強度スコア +8',
          bullets: ['主要 CTA 再定義', '比較ページ導線追加', '料金ページ要約化']
        },
        {
          title: '技術基盤チェック',
          rationale: '検索獲得の下振れを防ぐ監査が必要です。',
          impact: '技術リスク抑制',
          bullets: ['noindex 監査', '内部リンク改善', '構造化マークアップ再点検']
        }
      ]
    },
    strategy: {
      fitIndex: seededRange(seed, 76, 88),
      currentTheme: strategyPlans[0]!.title,
      structureRiskLabel: '比較導線不足: 高',
      marketPressureLabel: '市場競争圧 Low',
      industryGapDelta: 8,
      aiSummary: ['業界のボトルネックは「比較導線の再設計」にあります。', '差別化の明確化と信頼補強がまだ弱い状態です。'],
      improvements: [
        {
          title: '回遊導線の再設計',
          rankLabel: '1. 回遊導線の再設計',
          overview: '比較検討フェーズへの導線を強化します。',
          rationale: ['導線密度差 -12', '比較ページ導線の弱さ'],
          actions: ['比較ページへの導線追加', '主要 CTA 文言変更', '料金ページ要点整理'],
          impact: ['導線強度 +8', '意思決定支援 +6']
        },
        {
          title: '信頼訴求の強化',
          rankLabel: '2. 信頼訴求の強化',
          overview: '事例、FAQ、レビューを整理して不安を減らします。',
          rationale: ['導入実績の見せ方が弱い', 'FAQ 露出不足'],
          actions: ['導入事例再構成', 'FAQ 追加', 'レビュー導線固定'],
          impact: ['信頼構造 +10', '意思決定支援 +5']
        },
        {
          title: '差別化メッセージ明確化',
          rankLabel: '3. 差別化メッセージ明確化',
          overview: '抽象コピーから離れて、残る言葉を作ります。',
          rationale: ['抽象訴求が多い', '残る理由が弱い'],
          actions: ['ヒーローコピー刷新', '比較軸明文化', '差別化証拠追加'],
          impact: ['差別化指数 +8', '価値訴求 +6']
        }
      ],
      planPhases: (['day_30', 'day_60', 'day_90'] as const).map((phase) => ({
        phase,
        title: phase === 'day_30' ? '30日プラン' : phase === 'day_60' ? '60日プラン' : '90日プラン',
        objective: phase === 'day_30' ? '導線の土台を整える' : phase === 'day_60' ? '比較を前に進める' : '差別化を定着させる',
        progressLabel: phase === 'day_30' ? '進捗 1/3' : '進捗 0/3',
        progressCountLabel: phase === 'day_30' ? '着手: 1' : '着手: 0',
        nextAction: phase === 'day_30' ? '比較ページ導線を再設計' : phase === 'day_60' ? '導入事例を整理' : '差別化ページを刷新',
        tasks: phaseTasks.filter((task) => task.phaseCode === phase).map((task) => ({
          phaseTaskId: task.phaseTaskId,
          status: task.taskStatus,
          title: task.title
        }))
      }))
    },
    panoai: {
      summary: `${siteName} の snapshot を前提に、競合差分と優先施策について会話できます。`,
      prompts: ['競合上位との差分を 3 つに要約して', '30 日プランの最優先タスクを教えて', '業界構造の余白を営業観点で説明して'],
      contextNotes: ['現在の snapshot に紐づく情報のみを参照', '旧 snapshot 比較は未実装', '戦略プラン選択時にタスク文脈を更新']
    },
    strategyPlans,
    phaseTasks
  };

  const mergedSnapshot = {
    ...defaultSnapshot,
    ...options.overrides
  };

  return {
    ...mergedSnapshot,
    analysisSnapshotId,
    projectId: project.projectId,
    strategyPlans,
    phaseTasks
  };
}
