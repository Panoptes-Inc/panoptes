export type AnalysisLoadingStageId =
  | 'structure-detection'
  | 'industry-detection'
  | 'competitor-discovery'
  | 'competitor-analysis'
  | 'strategy-generation';

export type AnalysisLoadingStageVariant = 'message-only' | 'inference-review';

export type AnalysisLoadingConfidenceTone = 'high' | 'medium' | 'low';

export type AnalysisLoadingInferenceRow = {
  id: string;
  label: string;
  value: string;
  confidenceLabel?: string;
  confidenceTone?: AnalysisLoadingConfidenceTone;
};

export type AnalysisLoadingStageAction = {
  id: string;
  label: string;
  tone: 'secondary' | 'primary';
};

export type AnalysisLoadingStageState = {
  id: AnalysisLoadingStageId;
  title: string;
  message: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  variant?: AnalysisLoadingStageVariant;
  label?: string;
  shortDescription?: string;
  inferenceRows?: AnalysisLoadingInferenceRow[];
  actions?: AnalysisLoadingStageAction[];
};
