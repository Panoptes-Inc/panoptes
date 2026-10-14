export const SELF_ANALYSIS_AXIS_DEFINITIONS = [
	{ key: 'valueProposition', label: '価値訴求' },
	{ key: 'funnelStrength', label: '導線強度' },
	{ key: 'differentiationClarity', label: '差別化明確性' },
	{ key: 'informationHierarchy', label: '情報階層' },
	{ key: 'trustStructure', label: '信頼構造' },
	{ key: 'decisionSupport', label: '意思決定支援' }
] as const;

export type SelfAnalysisAxisKey = (typeof SELF_ANALYSIS_AXIS_DEFINITIONS)[number]['key'];

export function formatSelfAnalysisDeltaValue(value: number): string {
	return `${value >= 0 ? '+' : ''}${value}`;
}

export function createSelfImprovementCandidatePriorityLabel(index: number): string {
	return `${index + 1}. 優先候補`;
}
