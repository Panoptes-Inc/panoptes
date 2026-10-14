import type {
  PanoptesPhaseTask,
  PanoptesPhaseTaskStatus,
  PanoptesStrategyData,
  PanoptesStrategyPhase,
  PanoptesStrategyPlan
} from '$lib/panoptes/types';
import { PANOPTES_STRATEGY_PHASE_ORDER, strategyPhaseToDayLabel, strategyPhaseToObjective } from '$lib/panoptes/utils/guards';
import { safeText } from '$lib/panoptes/utils/text';
import { roadmapTaskStatusLabel } from './roadmap-phase-presentation';

export type StrategyAnalysisOverviewModel = {
  fitIndex: number;
  previousFitIndex: number;
  fitDelta: number;
  currentTheme: string;
  structureRiskLabel: string;
  marketPressureLabel: string;
  industryGapLabel: string;
  aiSummary: string;
};

export type StrategyAnalysisImprovementModel = {
  improvementPercent: number;
  dotCount: number;
  activeDotIndex: number;
  title: string;
  rankLabel: string;
  overview: string;
  rationale: string[];
  actions: string[];
  impact: string[];
  aiSummary: string;
};

export type StrategyAnalysisRailCardModel = {
  strategyPlanId: string;
  strategyKey: string;
  title: string;
  summary: string;
  priorityLabel: string;
  fitScoreLabel: string;
  dayLabel: string;
  progressPercent: number;
  statusLabel: string;
  isSelected: boolean;
};

export type StrategyAnalysisRoadmapTaskModel = {
  phaseTaskId: string;
  title: string;
  description: string | null;
  ownerLabel: string | null;
  dueHint: string | null;
  status: PanoptesPhaseTaskStatus;
  statusLabel: string;
  isChecked: boolean;
  isActive: boolean;
};

export type StrategyAnalysisRoadmapPhaseModel = {
  phase: PanoptesStrategyPhase;
  title: string;
  objective: string;
  progressLabel: string;
  progressCountLabel: string;
  nextAction: string;
  completionPercent: number;
  tasks: StrategyAnalysisRoadmapTaskModel[];
  activeTask: StrategyAnalysisRoadmapTaskModel | null;
};

export type StrategyAnalysisRoadmapModel = {
  projectDayCount: number;
  projectDayMax: number;
  projectDayPercent: number;
  selectedPhase: PanoptesStrategyPhase;
  phases: StrategyAnalysisRoadmapPhaseModel[];
};

export type StrategyAnalysisViewModel = {
  overview: StrategyAnalysisOverviewModel;
  improvement: StrategyAnalysisImprovementModel;
  rail: {
    siteName: string;
    cards: StrategyAnalysisRailCardModel[];
  };
  roadmap: StrategyAnalysisRoadmapModel;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function signedLabel(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function findSelectedPlanIndex(plans: PanoptesStrategyPlan[], selectedPlan: PanoptesStrategyPlan | null): number {
  if (!plans.length) return 0;
  if (!selectedPlan) return plans.findIndex((plan) => plan.isSelected);

  const selectedIndex = plans.findIndex((plan) => plan.strategyPlanId === selectedPlan.strategyPlanId);
  return selectedIndex >= 0 ? selectedIndex : plans.findIndex((plan) => plan.isSelected);
}

export function createStrategyAnalysisViewModel(input: {
  strategy: PanoptesStrategyData;
  plans?: PanoptesStrategyPlan[];
  allTasks?: PanoptesPhaseTask[];
  selectedPlan?: PanoptesStrategyPlan | null;
  selectedPhase?: PanoptesStrategyPhase;
  selectedTaskId?: string | null;
  siteName?: string;
  projectDayCount?: number;
}): StrategyAnalysisViewModel {
  const strategy = input.strategy;
  const plans = input.plans ?? [];
  const allTasks = input.allTasks ?? [];
  const selectedPhase = input.selectedPhase ?? 'day_30';
  const projectDayCount = input.projectDayCount ?? 24;
  const selectedPlanIndex = Math.max(findSelectedPlanIndex(plans, input.selectedPlan ?? null), 0);
  const selectedPlan = input.selectedPlan ?? plans[selectedPlanIndex] ?? plans.find((plan) => plan.isSelected) ?? null;
  const selectedImprovement =
    strategy.improvements[selectedPlanIndex] ??
    strategy.improvements[0] ?? {
      title: strategy.currentTheme,
      rankLabel: '優先戦略',
      overview: '現時点での推奨戦略を整備中です。',
      rationale: [],
      actions: [],
      impact: []
    };

  const fitDelta = clamp(Math.round(Math.abs(strategy.industryGapDelta) * 2), 4, 14);
  const previousFitIndex = clamp(strategy.fitIndex - fitDelta, 0, 100);
  const improvementPercent = clamp(Math.round(Math.abs(strategy.industryGapDelta) * 2 + 14), 8, 36);
  const currentPhaseTasks = allTasks.filter((task) => task.phaseCode === selectedPhase);
  const normalizedSelectedTaskId =
    currentPhaseTasks.find((task) => task.phaseTaskId === input.selectedTaskId)?.phaseTaskId ??
    currentPhaseTasks[0]?.phaseTaskId ??
    null;

  const roadmapPhases = PANOPTES_STRATEGY_PHASE_ORDER.map((phase) => {
    const phaseTasks = allTasks
      .filter((task) => task.phaseCode === phase)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const completedCount = phaseTasks.filter((task) => task.taskStatus === 'done').length;
    const phaseSeed = strategy.planPhases.find((item) => item.phase === phase);
    const activeTaskId = phase === selectedPhase ? normalizedSelectedTaskId : null;
    const tasks = phaseTasks.map((task) => ({
      phaseTaskId: task.phaseTaskId,
      title: safeText(task.title, '実行タスク'),
      description: task.description ? safeText(task.description, '実行意図を整理中です。') : null,
      ownerLabel: task.ownerLabel ? safeText(task.ownerLabel, '担当未定') : null,
      dueHint: task.dueHint ? safeText(task.dueHint, '日程調整中') : null,
      status: task.taskStatus,
      statusLabel: roadmapTaskStatusLabel(task.taskStatus),
      isChecked: task.taskStatus === 'done',
      isActive: task.phaseTaskId === activeTaskId
    }));

    return {
      phase,
      title: safeText(phaseSeed?.title, strategyPhaseToDayLabel(phase)),
      objective: safeText(phaseSeed?.objective, strategyPhaseToObjective(phase)),
      progressLabel: safeText(phaseSeed?.progressLabel, '進捗を整備中'),
      progressCountLabel: safeText(phaseSeed?.progressCountLabel, `${completedCount}/${phaseTasks.length}`),
      nextAction: safeText(
        phaseSeed?.nextAction,
        phaseTasks.find((task) => task.taskStatus !== 'done' && task.taskStatus !== 'cancelled')?.title ?? '次アクションを整理中'
      ),
      completionPercent: phaseTasks.length ? Math.round((completedCount / phaseTasks.length) * 100) : 0,
      tasks,
      activeTask: tasks.find((task) => task.isActive) ?? null
    };
  });

  return {
    overview: {
      fitIndex: strategy.fitIndex,
      previousFitIndex,
      fitDelta: strategy.fitIndex - previousFitIndex,
      currentTheme: safeText(selectedPlan?.title ?? strategy.currentTheme, '回遊導線の再設計'),
      structureRiskLabel: safeText(strategy.structureRiskLabel, '比較導線不足: 高'),
      marketPressureLabel: safeText(strategy.marketPressureLabel, 'Low'),
      industryGapLabel: signedLabel(strategy.industryGapDelta),
      aiSummary: safeText(
        strategy.aiSummary[0],
        '業界平均との差と比較導線の弱さから、差別化の明確化と導線再設計が重要です。'
      )
    },
    improvement: {
      improvementPercent,
      dotCount: Math.max(plans.length, 3),
      activeDotIndex: selectedPlanIndex,
      title: safeText(selectedImprovement.title, '回遊導線の再設計'),
      rankLabel: safeText(selectedImprovement.rankLabel, '1. 優先度 82'),
      overview: safeText(
        selectedImprovement.overview,
        '比較検討フェーズの離脱を減らし、ユーザーを意思決定ページまで自然につなげます。'
      ),
      rationale: selectedImprovement.rationale.map((item) => safeText(item, '比較導線の断絶を解消する')),
      actions: selectedImprovement.actions.map((item) => safeText(item, '主要 CTA と比較導線を再設計する')),
      impact: selectedImprovement.impact.map((item) => safeText(item, '導線設定スコア +8')),
      aiSummary: safeText(
        strategy.aiSummary[0],
        '現在のポジションは挑戦者です。差別化を明確化し、比較検討フェーズで競合に流れにくい構造へ寄せることが優先です。'
      )
    },
    rail: {
      siteName: safeText(input.siteName, 'OOサービス'),
      cards: plans.map((plan, index) => ({
        strategyPlanId: plan.strategyPlanId,
        strategyKey: plan.strategyKey,
        title: safeText(plan.title, `戦略プラン ${index + 1}`),
        summary: safeText(plan.summary, '比較導線と差別化の改善プラン'),
        priorityLabel: `優先度 ${plan.priorityRank ?? index + 1}`,
        fitScoreLabel: `適合 ${plan.fitScore ?? strategy.fitIndex}`,
        dayLabel: `${projectDayCount}日`,
        progressPercent: clamp(Math.round((plan.fitScore ?? strategy.fitIndex) / 100 * 100), 12, 100),
        statusLabel: plan.strategyPlanId === selectedPlan?.strategyPlanId ? `改善中 +${fitDelta}` : '候補',
        isSelected: plan.strategyPlanId === selectedPlan?.strategyPlanId
      }))
    },
    roadmap: {
      projectDayCount,
      projectDayMax: 90,
      projectDayPercent: clamp(Math.round((projectDayCount / 90) * 100), 0, 100),
      selectedPhase,
      phases: roadmapPhases
    }
  };
}
