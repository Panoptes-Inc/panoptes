export type CompetitorAnalysisRadarPoint = {
	label: string;
	value: number;
};

export type CompetitorExpandedActionLabels = {
	detail: string;
	compare: string;
};

export type CompetitorCompanyActionLabels = {
	detail: string;
	compare: string;
};

export const COMPETITOR_COMMON_AXIS_LABELS = [
	'価値訴求',
	'導線強度',
	'差別化',
	'情報階層',
	'信頼構造',
	'意思決定'
] as const;

function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.max(min, Math.min(max, value));
}

function createCompetitorScoreRingWithAccent(score: number, accentDegrees: number): string {
	const normalizedScore = clamp(score, 0, 100);
	const scoreDegrees = normalizedScore * 3.6;
	return `conic-gradient(#ff7a1a 0deg ${scoreDegrees}deg, #7d73ff ${scoreDegrees}deg ${scoreDegrees + accentDegrees}deg, #eeecfb ${scoreDegrees + accentDegrees}deg 360deg)`;
}

export function createCompetitorRadarPoints(input: {
	overallScore: number;
	internalStructureScore: number;
	visualScore: number;
}): CompetitorAnalysisRadarPoint[] {
	return [
		{ label: COMPETITOR_COMMON_AXIS_LABELS[0], value: clamp(input.overallScore - 4, 0, 100) },
		{ label: COMPETITOR_COMMON_AXIS_LABELS[1], value: clamp(input.internalStructureScore, 0, 100) },
		{ label: COMPETITOR_COMMON_AXIS_LABELS[2], value: clamp(input.overallScore - 8, 0, 100) },
		{ label: COMPETITOR_COMMON_AXIS_LABELS[3], value: clamp(input.visualScore, 0, 100) },
		{
			label: COMPETITOR_COMMON_AXIS_LABELS[4],
			value: clamp(input.internalStructureScore - 6, 0, 100)
		},
		{ label: COMPETITOR_COMMON_AXIS_LABELS[5], value: clamp(input.visualScore + 6, 0, 100) }
	];
}

export function createCompetitorExpandedScoreRing(score: number): string {
	return createCompetitorScoreRingWithAccent(score, 30);
}

export function createCompetitorCompanyScoreRing(score: number): string {
	return createCompetitorScoreRingWithAccent(score, 24);
}

export function formatCompetitorScorePercentage(score: number): string {
	return `${clamp(score, 0, 100)}%`;
}

export function createCompetitorCompareLabel(compared: boolean): string {
	return compared ? '比較解除' : '比較表示';
}

export function createCompetitorExpandedActionLabels(
	compared: boolean
): CompetitorExpandedActionLabels {
	return compared
		? { detail: '詳細を選択', compare: createCompetitorCompareLabel(true) }
		: { detail: '詳細を閉じる', compare: createCompetitorCompareLabel(false) };
}

export function createCompetitorCompanyActionLabels(
	compared: boolean
): CompetitorCompanyActionLabels {
	return {
		detail: '詳細分析',
		compare: createCompetitorCompareLabel(compared)
	};
}

export function normalizeCompetitorExternalUrl(value: unknown): string {
	if (typeof value !== 'string') return '';
	const candidate = value.trim();
	if (!candidate) return '';

	try {
		const url = new URL(candidate);
		if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
		return candidate;
	} catch {
		return '';
	}
}
