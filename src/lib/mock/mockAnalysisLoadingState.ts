import type { AnalysisLoadingStageId, AnalysisLoadingStageState } from '$lib/components/analysis/types';

export const mockAnalysisLoadingStages: AnalysisLoadingStageState[] = [
  {
    id: 'structure-detection',
    title: '\u5206\u6790\u5bfe\u8c61URL\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    message: '\u5206\u6790\u5bfe\u8c61URL\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    progress: 16,
    currentStep: 1,
    totalSteps: 5,
    variant: 'message-only',
    label: 'Structure Detection',
    shortDescription: 'url-analysis'
  },
  {
    id: 'industry-detection',
    title: '\u696d\u754c\u30fb\u69cb\u9020\u30bf\u30a4\u30d7\u81ea\u52d5\u63a8\u5b9a',
    message: '\u3053\u306e\u6761\u4ef6\u3092\u57fa\u6e96\u3068\u3057\u3066\u5206\u6790\u3092\u5b9f\u884c\u3057\u307e\u3059\u3002',
    progress: 34,
    currentStep: 2,
    totalSteps: 5,
    variant: 'inference-review',
    label: 'Industry Detection',
    shortDescription: 'auto-inference',
    inferenceRows: [
      {
        id: 'industry',
        label: '\u63a8\u5b9a\uff1a\u696d\u754c',
        value: '\u30b5\u30d6\u30b9\u30af\u578bB2B',
        confidenceLabel: '\uff08\u4fe1\u983c\u5ea6\uff1a\u9ad8\uff09',
        confidenceTone: 'high'
      },
      {
        id: 'structure',
        label: '\u63a8\u5b9a\uff1a\u69cb\u9020\u30bf\u30a4\u30d7',
        value: 'SaaS',
        confidenceLabel: '\uff08\u4fe1\u983c\u5ea6\uff1a\u4e2d\uff09',
        confidenceTone: 'medium'
      },
      {
        id: 'scale',
        label: '\u63a8\u5b9a\uff1a\u30b5\u30a4\u30c8\u898f\u6a21',
        value: '\u4e2d',
        confidenceLabel: '\uff08\u4fe1\u983c\u5ea6\uff1a\u4f4e\uff09',
        confidenceTone: 'low'
      }
    ],
    actions: [
      { id: 'revise', label: '\u4fee\u6b63\u3059\u308b', tone: 'secondary' },
      { id: 'start', label: '\u6226\u7565\u5206\u6790\u3092\u958b\u59cb', tone: 'primary' }
    ]
  },
  {
    id: 'competitor-discovery',
    title: '\u7af6\u5408\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    message: '\u7af6\u5408\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    progress: 51,
    currentStep: 3,
    totalSteps: 5,
    variant: 'message-only',
    label: 'Competitor Discovery',
    shortDescription: 'competitor-loading'
  },
  {
    id: 'competitor-analysis',
    title: '\u696d\u754c\u69cb\u9020\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    message: '\u696d\u754c\u69cb\u9020\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    progress: 73,
    currentStep: 4,
    totalSteps: 5,
    variant: 'message-only',
    label: 'Competitor Analysis',
    shortDescription: 'industry-loading'
  },
  {
    id: 'strategy-generation',
    title: '\u7af6\u5408\u00d7\u696d\u754c\u00d7\u81ea\u793e\u306e\u5dee\u5206\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    message: '\u7af6\u5408\u00d7\u696d\u754c\u00d7\u81ea\u793e\u306e\u5dee\u5206\u3092\u5206\u6790\u4e2d\u3067\u3059...',
    progress: 92,
    currentStep: 5,
    totalSteps: 5,
    variant: 'message-only',
    label: 'Strategy Generation',
    shortDescription: 'self-difference-loading'
  }
];

export const defaultMockAnalysisLoadingStageId: AnalysisLoadingStageId = 'structure-detection';

export const mockAnalysisLoadingStageMap = mockAnalysisLoadingStages.reduce(
  (accumulator, stage) => {
    accumulator[stage.id] = stage;
    return accumulator;
  },
  {} as Record<AnalysisLoadingStageId, AnalysisLoadingStageState>
);

export function getMockAnalysisLoadingStage(stageId: AnalysisLoadingStageId): AnalysisLoadingStageState {
  return mockAnalysisLoadingStageMap[stageId] ?? mockAnalysisLoadingStageMap[defaultMockAnalysisLoadingStageId];
}
