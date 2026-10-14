import type {
  PanoptesAnalysisRuntimeStore,
  PanoptesAnalysisSnapshotPayload,
  PanoptesAnalysisJobStatus,
  PanoptesInferenceDraft,
  PanoptesPhaseTask,
  PanoptesPhaseTaskStatus,
  PanoptesProjectDisplayState,
  PanoptesProjectRecord,
  PanoptesProjectStatus,
  PanoptesProjectSummary,
  PanoptesStrategyPhase,
  PanoptesStrategyPlan,
  PanoptesVisibleStep,
  PanoptesVisibleStepIndex
} from '$lib/panoptes/types';
import {
  buildMockSnapshotPayload,
  createDeterministicSnapshotFactoryDependencies
} from '$lib/panoptes/api/mock/snapshot-factory';
import seed from './panoptes_dummy_seed_v1_1_mapping_aligned.json';

const STEP_INDEX_BY_KEY: Record<PanoptesVisibleStep, PanoptesVisibleStepIndex> = {
  target_scan: 1,
  inference_review: 2,
  competitor_analysis: 3,
  industry_analysis: 4,
  strategy_synthesis: 5
};

const AXIS_LABELS = {
  valueProposition: '価値訴求',
  funnelStrength: '導線強度',
  differentiationClarity: '差別化明確性',
  informationHierarchy: '情報階層',
  trustStructure: '信頼構造',
  decisionSupport: '意思決定支援'
} as const;

const AXIS_KEYS = [
  'valueProposition',
  'funnelStrength',
  'differentiationClarity',
  'informationHierarchy',
  'trustStructure',
  'decisionSupport'
] as const;

type AxisKey = (typeof AXIS_KEYS)[number];

type SeedProjectListItem = (typeof seed.projectList.items)[number];
type SeedStrategyCard = (typeof seed.strategyAnalysisView.strategyCards)[number];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toVisibleStep(value: string | undefined): PanoptesVisibleStep {
  if (
    value === 'target_scan' ||
    value === 'inference_review' ||
    value === 'competitor_analysis' ||
    value === 'industry_analysis' ||
    value === 'strategy_synthesis'
  ) {
    return value;
  }

  return 'target_scan';
}

function toStepIndex(value: string | undefined): PanoptesVisibleStepIndex {
  return STEP_INDEX_BY_KEY[toVisibleStep(value)];
}

function toProjectStatus(value: string | undefined): PanoptesProjectStatus {
  switch (value) {
    case 'ready':
      return 'ready';
    case 'analyzing':
      return 'analyzing';
    case 'failed':
      return 'failed';
    default:
      return 'empty';
  }
}

function toDisplayState(value: string | undefined): PanoptesProjectDisplayState {
  switch (value) {
    case 'ready':
      return 'ready';
    case 'analyzing':
      return 'analyzing';
    case 'failed':
      return 'failed';
    default:
      return 'empty';
  }
}

function toAnalysisJobStatus(value: string | undefined): PanoptesAnalysisJobStatus {
  switch (value) {
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    case 'awaiting_confirmation':
      return 'awaiting_confirmation';
    case 'completing':
      return 'completing';
    default:
      return 'running';
  }
}

function toTaskStatus(value: string | undefined): PanoptesPhaseTaskStatus {
  switch (value) {
    case 'done':
      return 'done';
    case 'doing':
      return 'in_progress';
    case 'blocked':
      return 'blocked';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'todo';
  }
}

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function buildStrategyPlans(): PanoptesStrategyPlan[] {
  const snapshotId = seed.projectList.items[0]?.currentSnapshotId ?? 'snap_dummy_001';
  return seed.strategyAnalysisView.strategyCards.map((card, index) => ({
    strategyPlanId: `plan_${card.strategyRank}`,
    analysisSnapshotId: snapshotId,
    strategyKey: `strategy_${card.strategyRank}`,
    title: card.strategyTitle,
    summary: card.strategicIntentText,
    fitScore: card.priorityScore,
    priorityRank: index + 1,
    isSelected: index === 0,
    createdAt: seed.meta.updatedAt,
    updatedAt: seed.meta.updatedAt
  }));
}

const strategyPlans = buildStrategyPlans();

function buildPhaseTasks(): PanoptesPhaseTask[] {
  const phaseEntries: Array<{ phaseCode: PanoptesStrategyPhase; phaseSeed: (typeof seed.roadmapView.day30) }> = [
    { phaseCode: 'day_30', phaseSeed: seed.roadmapView.day30 },
    { phaseCode: 'day_60', phaseSeed: seed.roadmapView.day60 },
    { phaseCode: 'day_90', phaseSeed: seed.roadmapView.day90 }
  ];

  return strategyPlans.flatMap((plan, planIndex) =>
    phaseEntries.flatMap(({ phaseCode, phaseSeed }) =>
      phaseSeed.phaseTaskItems.map((task, taskIndex) => ({
        phaseTaskId: `${plan.strategyPlanId}_${phaseCode}_${taskIndex + 1}`,
        strategyPlanId: plan.strategyPlanId,
        phaseCode,
        title: task.taskTitle,
        description: `${phaseSeed.phaseGoalText}を進めるための実行タスク`,
        sortOrder: taskIndex + 1,
        taskStatus: planIndex === 0 ? toTaskStatus(task.taskStatusLabel) : 'todo',
        ownerLabel: planIndex === 0 ? 'Growth Team' : 'Strategy Team',
        dueHint: phaseSeed.nextActionText,
        createdAt: seed.meta.updatedAt,
        updatedAt: seed.meta.updatedAt
      }))
    )
  );
}

const phaseTasks = buildPhaseTasks();

const firstProject = seed.projectList.items[0];
const activeAnalysisJob = seed.analysisJobs[0];

const selfAxisDeltaScores = seed.selfAnalysisView.selfVsIndustryAxisDeltaScores;
const industryAxisBenchmarkScores = seed.industryAnalysisView.industryAxisBenchmarkScores;

const dummySelfSource = {
  companyName: seed.selfAnalysisView.companyName,
  serviceName: seed.selfAnalysisView.serviceName,
  overallScore: seed.selfAnalysisView.overallScore,
  internalScore: seed.selfAnalysisView.internalScore,
  typeLabel: seed.selfAnalysisView.marketTypeLabel,
  marketTypeLabel: seed.selfAnalysisView.marketTypeLabel,
  structureScore: seed.selfAnalysisView.internalScore,
  visualScore: seed.selfAnalysisView.visualScore,
  axisDeltaScores: selfAxisDeltaScores,
  gapBadges: AXIS_KEYS.map((axisKey) => `${AXIS_LABELS[axisKey]} ${formatSigned(selfAxisDeltaScores[axisKey])}`),
  radar: AXIS_KEYS.map((axisKey) => ({
    label: AXIS_LABELS[axisKey],
    self: clamp(industryAxisBenchmarkScores[axisKey] + selfAxisDeltaScores[axisKey], 0, 100),
    industry: industryAxisBenchmarkScores[axisKey]
  })),
  strengths: seed.selfAnalysisView.strengthTopItems,
  issues: seed.selfAnalysisView.issueTopItems,
  breakdown: seed.selfAnalysisView.structureBreakdownItems.map((item) => ({
    label: item.breakdownLabel,
    score: item.breakdownScore,
    finding: item.findingText
  })),
  summaryText: seed.selfAnalysisView.selfSummaryText,
  aiSummary: [seed.selfAnalysisView.selfSummaryText],
  actionCards: seed.strategyAnalysisView.strategyCards.slice(0, 2).map((card) => ({
    title: card.strategyTitle,
    rationale: card.strategicIntentText,
    impact: Object.entries(card.expectedAxisLift)
      .map(([axisKey, value]) => `${AXIS_LABELS[axisKey as AxisKey]} ${formatSigned(value)}`)
      .join(' / '),
    bullets: card.executionActionItems
  }))
};

function buildCompetitorCards(): PanoptesAnalysisSnapshotPayload['competitors']['cards'] {
  const detailMap = new Map(
    seed.competitorAnalysisView.openedCompetitorCards.map((item) => [item.competitorId, item])
  );

  return seed.competitorAnalysisView.competitorSummaryCards.map((summary) => {
    const detail = detailMap.get(summary.competitorId);
    return {
      competitorId: summary.competitorId,
      companyName: summary.companyName,
      serviceName: summary.serviceName,
      url: `https://${summary.competitorId}.example.com`,
      marketTypeLabel: summary.marketTypeLabel,
      internalStructureScore: summary.internalScore,
      visualScore: summary.visualScore,
      overallScore: summary.overallScore,
      fitReason: detail?.marketPositionSummaryLabel ?? summary.marketPositionSummaryLabel,
      tags: detail?.descriptorBadges ?? [],
      insightLines: [
        `ポジション: ${detail?.marketPositionSummaryLabel ?? summary.marketPositionSummaryLabel}`,
        `検討周期: ${detail?.considerationPeriodLabel ?? '比較検討期'}`,
        `導線タイプ: ${detail?.funnelTypeLabel ?? '比較検討型'}`
      ],
      actionBullets: detail?.mustElementLabels ?? ['価格', '比較表', '実績'],
      detailSummary: detail?.competitorSummaryText ?? summary.marketPositionSummaryLabel
    };
  });
}

function buildIndustryData(): PanoptesAnalysisSnapshotPayload['industry'] {
  return {
    analyzedAt: seed.meta.updatedAt.slice(0, 10).replace(/-/g, '.'),
    signals: seed.industryAnalysisView.marketTagLabels,
    marketType: {
      typeLabel: seed.industryAnalysisView.marketTypeLabel,
      confidence: seed.industryAnalysisView.industryUiConfidencePercent,
      description: '成熟市場の中で比較検討が強く発生し、導線設計と信頼訴求の精度が勝敗を左右しています。',
      detail: seed.industryAnalysisView.industrySummaryText
    },
    rating: {
      metrics: AXIS_KEYS.map((axisKey, index) => ({
        label: AXIS_LABELS[axisKey],
        value: industryAxisBenchmarkScores[axisKey],
        tone: index < 2 ? 'orange' : index < 4 ? 'violet' : 'orange-soft'
      })),
      highlights: [
        {
          title: '構造安定度',
          accent: `構造安定度: ${seed.industryAnalysisView.structureStabilityLabel}`,
          body: `スコア ${seed.industryAnalysisView.structureStabilityScore}`
        },
        {
          title: '差別化余白',
          accent: `差別化余白: ${seed.industryAnalysisView.differentiationSlackLabel}`,
          body: `スコア ${seed.industryAnalysisView.differentiationSlackScore}`
        }
      ],
      insight: {
        label: 'Panoptes AI',
        paragraphs: [seed.industryAnalysisView.industrySummaryText]
      }
    },
    position: {
      pressureLabel: `市場競争圧: ${seed.industryAnalysisView.marketPressureLabel}`,
      cards: [
        {
          title: '自社ポジション',
          lines: [
            `現在位置: ${seed.industryAnalysisView.positionMap.marketPositionBucketLabel}`,
            `業界平均との差: ${seed.industryAnalysisView.positionMap.industryAverageDelta}`
          ]
        },
        {
          title: '市場の圧力',
          lines: [
            `競争圧: ${seed.industryAnalysisView.marketPressureLabel}`,
            `正規化値: ${Math.round(seed.industryAnalysisView.marketPressureNormalized * 100)}`
          ]
        }
      ],
      matrix: {
        pointLabel: seed.industryAnalysisView.positionMap.marketPositionBucketLabel,
        pointX: 0.72,
        pointY: clamp(1 - seed.industryAnalysisView.marketPressureNormalized, 0.18, 0.82),
        xAxisLabels: ['平均帯', '先行帯'],
        yAxisLabels: ['平均帯', '構造優位']
      },
      insight: {
        label: 'Panoptes AI',
        paragraphs: [
          `業界平均との差は ${seed.industryAnalysisView.positionMap.industryAverageDelta}。`,
          `${seed.industryAnalysisView.marketPressureLabel} 圧のため、差別化言語化の改善余地があります。`
        ]
      }
    },
    distribution: {
      primary: {
        title: '平均優位型',
        subLabel: '平均型',
        value: 50,
        descriptor: '業界性格',
        descriptorText: '中程度の競争市場',
        color: '#ff6d1d'
      },
      secondary: [
        {
          title: '構造優位',
          value: Math.round(seed.industryAnalysisView.structureStabilityScore / 4),
          color: '#ffb56f'
        },
        {
          title: '訴求特価',
          value: Math.round(seed.industryAnalysisView.differentiationSlackScore / 3),
          color: '#ffd8bd'
        }
      ],
      stats: [
        { label: '業界UI確信度', value: `${seed.industryAnalysisView.industryUiConfidencePercent}%` },
        { label: '市場圧力', value: seed.industryAnalysisView.marketPressureLabel },
        { label: '市場型', value: seed.industryAnalysisView.marketTypeLabel }
      ],
      leaders: seed.industryAnalysisView.opportunityItems.map((item) => item.opportunityTitle),
      insight: {
        label: 'Panoptes AI',
        paragraphs: ['構造優位と差別化余白の両方が残っており、設計次第で抜けられる市場です。']
      }
    },
    opportunity: {
      lanes: seed.industryAnalysisView.opportunityItems.map((item) => ({
        title: item.opportunityTitle,
        reason: item.opportunitySummary,
        gaps: [
          `機会スコア: ${item.opportunityScore}`,
          `市場型: ${seed.industryAnalysisView.marketTypeLabel}`
        ],
        actions: ['仮説の言語化', '主要導線の再設計', '実装優先順位の整理']
      })),
      summary: {
        battlefields: seed.industryAnalysisView.opportunityItems.map((item) => item.opportunityTitle),
        priorities: seed.strategyAnalysisView.strategyCards.map((card) => card.strategyTitle)
      },
      insight: {
        label: 'Panoptes AI',
        paragraphs: ['比較導線、信頼接点、差別化言語化の3点が最優先の改善余白です。']
      }
    }
  };
}

function buildStrategyData(): PanoptesAnalysisSnapshotPayload['strategy'] {
  const phaseSeeds = [
    { phase: 'day_30' as const, seedPhase: seed.roadmapView.day30 },
    { phase: 'day_60' as const, seedPhase: seed.roadmapView.day60 },
    { phase: 'day_90' as const, seedPhase: seed.roadmapView.day90 }
  ];

  return {
    fitIndex: seed.strategyAnalysisView.strategicFitScore,
    currentTheme: seed.strategyAnalysisView.currentStrategyThemeLabel,
    structureRiskLabel: `${seed.strategyAnalysisView.riskFamilyLabel}: ${seed.strategyAnalysisView.riskSeverityLabel}`,
    marketPressureLabel: ` ${seed.strategyAnalysisView.marketPressureLabel}`,
    industryGapDelta: seed.strategyAnalysisView.industryAverageDelta,
    aiSummary: [seed.strategyAnalysisView.strategySummaryText],
    improvements: seed.strategyAnalysisView.strategyCards.map((card) => ({
      title: card.strategyTitle,
      rankLabel: `${card.strategyRank}. 優先度 ${card.priorityScore}`,
      overview: card.strategicIntentText,
      rationale: card.strategyEvidenceItems,
      actions: card.executionActionItems,
      impact: Object.entries(card.expectedAxisLift).map(
        ([axisKey, value]) => `${AXIS_LABELS[axisKey as AxisKey]} ${formatSigned(value)}`
      )
    })),
    planPhases: phaseSeeds.map(({ phase, seedPhase }) => ({
      phase,
      title: `${seedPhase.phaseLabel}プラン`,
      objective: seedPhase.phaseGoalText,
      progressLabel: seedPhase.phaseOwnerStatusLabel,
      progressCountLabel: seedPhase.phaseProgressFractionLabel,
      nextAction: seedPhase.nextActionText,
      tasks: phaseTasks
        .filter((task) => task.strategyPlanId === strategyPlans[0]?.strategyPlanId && task.phaseCode === phase)
        .map((task) => ({
          phaseTaskId: task.phaseTaskId,
          status: task.taskStatus,
          title: task.title
      }))
    }))
  };
}

function buildDummyInferenceDraft(): PanoptesInferenceDraft {
  return {
    inferredIndustry: seed.analysisFlow.visibleStepItems[1]?.inferenceReview?.inferredIndustryLabel ?? 'BtoB SaaS',
    inferredStructureType: seed.analysisFlow.visibleStepItems[1]?.inferenceReview?.inferredStructureTypeLabel ?? '比較検討型',
    inferredSiteScale: seed.analysisFlow.visibleStepItems[1]?.inferenceReview?.inferredSiteScaleLabel ?? '中',
    industryConfidence: 'high',
    structureConfidence: 'medium',
    scaleConfidence: 'low',
    notes: ['開発用ダミーのため、UI 調整しやすい推定結果を固定で返しています。'],
    canEdit: true,
    lockedAfterConfirm: true
  };
}

const dummyInferenceDraft = buildDummyInferenceDraft();

const dummySnapshotProject: PanoptesProjectRecord = {
  projectId: firstProject?.projectId ?? 'proj_dummy_001',
  orgId: 'org_dummy_panoptes',
  projectName: firstProject?.projectDisplayName ?? seed.selfAnalysisView.companyName,
  targetUrl: firstProject?.targetUrl ?? 'https://panoptes-demo.example.com',
  normalizedTargetUrl: firstProject?.targetUrl ?? 'https://panoptes-demo.example.com',
  projectStatus: toProjectStatus(firstProject?.projectStatusLabel),
  currentSnapshotId: firstProject?.currentSnapshotId ?? 'snap_dummy_001',
  latestAnalysisJobId: firstProject?.latestAnalysisJobId ?? activeAnalysisJob?.analysisJobId ?? null,
  latestAnalysisSessionId: firstProject?.latestAnalysisJobId
    ? `session_${firstProject.latestAnalysisJobId}`
    : activeAnalysisJob?.analysisJobId
      ? `session_${activeAnalysisJob.analysisJobId}`
      : null,
  currentStrategyPlanId: strategyPlans[0]?.strategyPlanId ?? null,
  selectedStrategyKey: strategyPlans[0]?.strategyKey ?? null,
  strategyStatusLabel: 'improving',
  createdAt: seed.meta.updatedAt,
  updatedAt: seed.meta.updatedAt
};

const dummySnapshotFactoryDeps = createDeterministicSnapshotFactoryDependencies({
  fixedSnapshotId: firstProject?.currentSnapshotId ?? 'snap_dummy_001',
  nowIso: seed.meta.updatedAt,
  seedKey: firstProject?.projectId ?? 'proj_dummy_001'
});

export const dummySnapshot: PanoptesAnalysisSnapshotPayload = buildMockSnapshotPayload(
  dummySnapshotProject,
  dummyInferenceDraft,
  dummySnapshotFactoryDeps,
  {
    analysisSnapshotId: firstProject?.currentSnapshotId ?? 'snap_dummy_001',
    strategyPlans,
    phaseTasks,
    overrides: {
      versionLabel: seed.meta.version,
      analyzedAt: seed.meta.updatedAt,
      siteName: seed.selfAnalysisView.companyName,
      meta: {
        tokenUsageRate: 64,
        memoryLabel: '?????',
        projectDayCount: firstProject?.projectAgeDays ?? 24,
        analyzedDateLabel: seed.meta.updatedAt.slice(0, 10).replace(/-/g, '.')
      },
      competitors: {
        summaryTitle: '????????',
        summaryText: '?????????????? UI ????????????',
        cards: buildCompetitorCards()
      },
      industry: buildIndustryData(),
      self: dummySelfSource as PanoptesAnalysisSnapshotPayload['self'],
      strategy: buildStrategyData(),
      panoai: {
        summary: '????????????????????? preview ??????????',
        prompts: [
          '????????? 3 ??????',
          '30?????????????????',
          '????????????????????'
        ],
        contextNotes: [
          '???????????????',
          '?? snapshot ???? UI ????',
          'strategy card ?????? roadmap ?????'
        ]
      }
    }
  }
);

function buildProjectSummary(item: SeedProjectListItem): PanoptesProjectSummary {
  const runningJob = seed.analysisJobs.find((job) => job.projectId === item.projectId) ?? activeAnalysisJob;
  const projectStatus = toProjectStatus(item.projectStatusLabel);
  const displayState = toDisplayState(item.projectStatusLabel);
  const latestProgressPhase = item.projectStatusLabel === 'ready' ? 'strategy_synthesis' : toVisibleStep(runningJob?.visibleStepKey);

  return {
    projectId: item.projectId,
    orgId: 'org_dummy_panoptes',
    projectName: item.projectDisplayName,
    targetUrl: item.targetUrl,
    normalizedTargetUrl: item.targetUrl,
    projectStatus,
    displayState,
    currentSnapshotId: item.currentSnapshotId,
    latestAnalysisJobId: item.latestAnalysisJobId,
    latestAnalysisSessionId: item.latestAnalysisJobId ? `session_${item.latestAnalysisJobId}` : null,
    currentStrategyPlanId: item.currentSnapshotId ? strategyPlans[0]?.strategyPlanId ?? null : null,
    selectedStrategyKey: item.currentSnapshotId ? strategyPlans[0]?.strategyKey ?? null : null,
    strategyStatusLabel: item.currentSnapshotId ? 'improving' : null,
    latestJobStatus: item.projectStatusLabel === 'ready' ? 'completed' : toAnalysisJobStatus(runningJob?.analysisJobStatusLabel),
    latestProgressPhase,
    latestProgressStepIndex: toStepIndex(latestProgressPhase),
    latestProgressPercent: item.projectStatusLabel === 'ready' ? 100 : runningJob?.progressPercent ?? 0,
    latestStatusMessage:
      item.projectStatusLabel === 'ready' ? 'snapshot ready' : seed.analysisFlow.visibleStepItems.find(
        (stepItem) => stepItem.visibleStepKey === latestProgressPhase
      )?.visibleStepLabel ?? '分析中',
    latestErrorCode: null,
    createdAt: seed.meta.updatedAt,
    updatedAt: seed.meta.updatedAt
  };
}

export const dummyProjectSummaries: PanoptesProjectSummary[] = seed.projectList.items.map(buildProjectSummary);

export const dummyHeaderMeta = {
  tokenUsageRate: 64,
  memoryLabel: '記憶稼働中',
  projectDayCount: firstProject?.projectAgeDays ?? 24,
  projectDayMax: 90,
  aiModeLabel: 'デフォルト',
  tokenModeLabel: '高負荷',
  projectStatusLabel: firstProject?.projectStatusLabel === 'ready' ? '保存済' : '分析中',
  analyzedDateLabel: seed.meta.updatedAt.slice(0, 10).replace(/-/g, '.')
};

export const dummyAppTopCopy = {
  note: 'ダミーデータで UI 調整中',
  shellTitle: 'Panoptes App Shell',
  shellBody: 'hero/search は入口として残し、その下に persistent shell を常設しています。'
};

export const dummyTopSearchSuggestions = [
  firstProject?.targetUrl ?? 'https://yuu-example.jp/',
  seed.projectList.items[1]?.targetUrl ?? 'https://akari-example.jp/',
  'https://competitor-lp.example.com/',
  'https://industry-demo.example.com/'
];

export { dummyInferenceDraft };

export const dummyAnalysisPreviewPresentations: Record<
  PanoptesVisibleStep,
  { title: string; subtitle: string; showConfirmButton: boolean }
> = {
  target_scan: {
    title: '分析対象URLを解析中です',
    subtitle: 'サイト構造と基本シグナルを収集中です。',
    showConfirmButton: false
  },
  inference_review: {
    title: '業界・構造タイプの推定結果を確認してください',
    subtitle: '確定後に競合分析へ進みます。',
    showConfirmButton: true
  },
  competitor_analysis: {
    title: '競合を分析中です',
    subtitle: '比較対象の導線、訴求、信頼構造を収集中です。',
    showConfirmButton: false
  },
  industry_analysis: {
    title: '業界構造を分析中です',
    subtitle: '市場タイプ、ポジション、機会余白を整理しています。',
    showConfirmButton: false
  },
  strategy_synthesis: {
    title: '戦略シナリオを構築中です',
    subtitle: '競合・業界・自社の差分から 30 / 60 / 90 日計画を生成しています。',
    showConfirmButton: false
  }
};

export function createDummyAnalysisRuntime(step: PanoptesVisibleStep): PanoptesAnalysisRuntimeStore {
  return {
    activeProjectId: dummyProjectSummaries[1]?.projectId ?? dummyProjectSummaries[0]?.projectId ?? null,
    activeJobId: activeAnalysisJob?.analysisJobId ?? null,
    activeAnalysisSessionId: activeAnalysisJob?.analysisJobId ? `session_${activeAnalysisJob.analysisJobId}` : null,
    runtimeStatus: step === 'inference_review' ? 'waiting_for_inference_confirmation' : step === 'strategy_synthesis' ? 'committing_snapshot' : 'running',
    visibleStep: step,
    visibleStepIndex: STEP_INDEX_BY_KEY[step],
    serverConfirmedPhase: step,
    serverConfirmedStepIndex: STEP_INDEX_BY_KEY[step],
    progressPercent:
      step === 'target_scan'
        ? 18
        : step === 'inference_review'
          ? 100
          : step === 'competitor_analysis'
            ? 46
            : step === 'industry_analysis'
              ? 72
              : 88,
    statusMessage: dummyAnalysisPreviewPresentations[step].title,
    inferenceDraft: step === 'inference_review' ? dummyInferenceDraft : null,
    canConfirmInference: step === 'inference_review',
    confirmMutationStatus: 'idle',
    pollingStatus: 'polling',
    pollingIntervalMs: 1200,
    lastProgressEventAt: seed.meta.updatedAt,
    terminalReason: null
  };
}

export const dummyScoreCards = [
  { title: '総合スコア', value: dummySnapshot.self.overallScore },
  { title: '戦略適合', value: dummySnapshot.strategy.fitIndex },
  { title: '競争圧', value: Math.round(seed.strategyAnalysisView.marketPressureNormalized * 100) }
];

export const dummyAdminSummary = {
  priorityUsers: seed.admin.summary.priorityRegisteredUsersCount,
  capacity: seed.admin.summary.priorityUserLimitCount,
  regularUsers: seed.admin.summary.normalRegisteredUsersCount,
  todayRegistrations: seed.admin.summary.todayRegisteredUsersCount,
  priorityAcceptedUsers: seed.admin.summary.approvedPriorityUsersCount,
  freePlanUsers: seed.admin.summary.freeUsersCount,
  miniPlanUsers: seed.admin.summary.miniPlanUsersCount,
  miniPlanRevenue: seed.admin.summary.miniPlanRevenueJpy
};

export const dummyAdminUsers = seed.admin.users.map((user) => ({
  id: user.id,
  order: user.sortOrder,
  email: user.email,
  plan: user.planName,
  createdAt: user.createdAt,
  source: user.sourceLabel,
  url: user.siteUrl,
  status: user.approvalStatusLabel
}));

export const dummyAdminLogs = [
  { id: 'log_001', timestamp: '2026/03/14 12:00', label: 'dummy seed loaded' },
  { id: 'log_002', timestamp: '2026/03/14 12:01', label: 'analysis preview mounted' },
  { id: 'log_003', timestamp: '2026/03/14 12:03', label: 'strategy cards synchronized' }
];

export const dummyAdminServiceStatuses = [
  { id: 'svc_api', label: 'Panoptes API', state: 'green' },
  { id: 'svc_worker', label: 'Analysis Worker', state: 'green' },
  { id: 'svc_snapshot', label: 'Snapshot Commit', state: 'yellow' }
];

