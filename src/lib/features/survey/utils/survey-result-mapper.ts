import type { SurveyAnswers, SurveyPayload } from '../types';
import { normalizeSurveyAnswer } from '../validation/survey-validation';

function normalizedString(answers: SurveyAnswers, key: keyof SurveyPayload): string {
	const value = normalizeSurveyAnswer(answers[key]);
	return typeof value === 'string' ? value : '';
}

export function mapSurveyResult(answers: SurveyAnswers): SurveyPayload {
	return {
		purpose: normalizedString(answers, 'purpose'),
		projectType: normalizedString(answers, 'projectType'),
		comment: normalizedString(answers, 'comment'),
		email: normalizedString(answers, 'email').toLowerCase()
	};
}
