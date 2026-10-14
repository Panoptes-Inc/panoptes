const fallbackSurveyError = '送信に失敗しました。時間をおいて再度お試しください。';

export function mapSurveySubmitError(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	return fallbackSurveyError;
}
