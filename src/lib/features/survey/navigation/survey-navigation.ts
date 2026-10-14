export function clampSurveyPage(page: number, pageCount: number): number {
	return Math.min(Math.max(0, page), Math.max(0, pageCount - 1));
}

export function nextSurveyPage(page: number, pageCount: number): number {
	return clampSurveyPage(page + 1, pageCount);
}

export function previousSurveyPage(page: number, pageCount: number): number {
	return clampSurveyPage(page - 1, pageCount);
}

export function isFinalSurveyPage(page: number, pageCount: number): boolean {
	return clampSurveyPage(page, pageCount) === Math.max(0, pageCount - 1);
}

export function surveyProgress(page: number, pageCount: number): number {
	if (pageCount <= 0) return 0;
	return Math.round(((clampSurveyPage(page, pageCount) + 1) / pageCount) * 100);
}
