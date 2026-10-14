import type {
	SurveyAnswerValue,
	SurveyAnswers,
	SurveyFieldErrors,
	SurveyQuestion,
	SurveyQuestionId
} from '../types';

export type SurveyValidationErrorCode =
	| 'required'
	| 'invalid_email'
	| 'invalid_option'
	| 'too_many_selections'
	| 'text_too_short'
	| 'text_too_long'
	| 'unknown_question';

export type SurveyValidationResult =
	| { valid: true }
	| { valid: false; code: SurveyValidationErrorCode; message: string };

export const requiredSurveyMessage = '必須項目を入力してください。';
export const invalidSurveyEmailMessage = 'メールアドレスの形式が正しくありません。';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSurveyAnswer(value: SurveyAnswerValue): SurveyAnswerValue {
	if (typeof value === 'string') return value.trim();
	if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
	return null;
}

export function validateSurveyAnswer(
	question: SurveyQuestion | undefined,
	value: SurveyAnswerValue
): SurveyValidationResult {
	if (!question) return { valid: false, code: 'unknown_question', message: requiredSurveyMessage };
	const normalized = normalizeSurveyAnswer(value);
	const empty = normalized === null || normalized === '' || (Array.isArray(normalized) && normalized.length === 0);
	if (question.required && empty) return { valid: false, code: 'required', message: requiredSurveyMessage };
	if (empty) return { valid: true };

	if (question.type === 'single_choice' || question.type === 'multiple_choice') {
		const values = Array.isArray(normalized) ? normalized : [normalized];
		const allowed = new Set(question.options.map((option) => option.value));
		if (values.some((item) => !allowed.has(item))) {
			return { valid: false, code: 'invalid_option', message: requiredSurveyMessage };
		}
		if (question.type === 'multiple_choice' && question.maxSelections && values.length > question.maxSelections) {
			return { valid: false, code: 'too_many_selections', message: requiredSurveyMessage };
		}
	}

	if (question.type === 'email' && typeof normalized === 'string' && !emailPattern.test(normalized.toLowerCase())) {
		return { valid: false, code: 'invalid_email', message: invalidSurveyEmailMessage };
	}
	if ((question.type === 'text' || question.type === 'email') && typeof normalized === 'string') {
		if (question.minLength && normalized.length < question.minLength) {
			return { valid: false, code: 'text_too_short', message: requiredSurveyMessage };
		}
		if (question.maxLength && normalized.length > question.maxLength) {
			return { valid: false, code: 'text_too_long', message: requiredSurveyMessage };
		}
	}
	return { valid: true };
}

export function validateSurvey(
	questions: readonly SurveyQuestion[],
	answers: SurveyAnswers
): { valid: true; fieldErrors: SurveyFieldErrors } | { valid: false; fieldErrors: SurveyFieldErrors; message: string } {
	const fieldErrors: SurveyFieldErrors = {};
	for (const question of questions) {
		const result = validateSurveyAnswer(question, answers[question.id]);
		if (result.valid === false) fieldErrors[question.id] = result.message;
	}
	const firstErrorId = questions.find((question) => fieldErrors[question.id])?.id as SurveyQuestionId | undefined;
	if (!firstErrorId) return { valid: true, fieldErrors };
	return { valid: false, fieldErrors, message: fieldErrors[firstErrorId] ?? requiredSurveyMessage };
}
