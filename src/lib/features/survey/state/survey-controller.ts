import { isFinalSurveyPage, nextSurveyPage, previousSurveyPage, surveyProgress } from '../navigation/survey-navigation';
import { createEmptySurveyAnswers, surveyPageCount, surveyQuestions } from '../schema/survey-questions';
import { submitSurvey } from '../services/survey-service';
import type {
	SurveyAnswerValue,
	SurveyQuestionId,
	SurveySnapshot,
	SurveyStatus,
	SurveySubmitter
} from '../types';
import { mapSurveySubmitError } from '../utils/survey-error-mapper';
import { mapSurveyResult } from '../utils/survey-result-mapper';
import { validateSurvey } from '../validation/survey-validation';
import { canBeginSurveySubmit, retryableSurveyStatus } from './survey-state-machine';

export const surveySuccessMessage = 'ご回答ありがとうございます。開発の参考に活用します。';

export function createSurveyController(initialSubmitter?: SurveySubmitter) {
	let answers = createEmptySurveyAnswers();
	let status: SurveyStatus = 'idle';
	let errorMessage = '';
	let successMessage = '';
	let fieldErrors: SurveySnapshot['fieldErrors'] = {};
	let currentPage = 0;
	let submitter = initialSubmitter;
	let destroyed = false;
	const listeners = new Set<(snapshot: SurveySnapshot) => void>();

	function snapshot(): SurveySnapshot {
		return {
			answers: { ...answers },
			status,
			errorMessage,
			successMessage,
			fieldErrors: { ...fieldErrors },
			currentPage,
			pageCount: surveyPageCount,
			progress: surveyProgress(currentPage, surveyPageCount),
			canGoBack: currentPage > 0,
			canGoNext: !isFinalSurveyPage(currentPage, surveyPageCount),
			canSubmit: isFinalSurveyPage(currentPage, surveyPageCount) && status !== 'submitting'
		};
	}

	function notify() {
		if (destroyed) return;
		const next = snapshot();
		for (const listener of listeners) listener(next);
	}

	function subscribe(listener: (snapshot: SurveySnapshot) => void): () => void {
		if (destroyed) return () => undefined;
		listeners.add(listener);
		listener(snapshot());
		return () => listeners.delete(listener);
	}

	function setAnswer(questionId: SurveyQuestionId, value: SurveyAnswerValue) {
		if (destroyed || status === 'submitting') return;
		answers = { ...answers, [questionId]: Array.isArray(value) ? [...value] : value };
		status = retryableSurveyStatus(status) === 'idle' ? 'answering' : retryableSurveyStatus(status);
		errorMessage = '';
		fieldErrors = { ...fieldErrors, [questionId]: undefined };
		notify();
	}

	function next() {
		currentPage = nextSurveyPage(currentPage, surveyPageCount);
		notify();
	}

	function back() {
		currentPage = previousSurveyPage(currentPage, surveyPageCount);
		notify();
	}

	async function submit(): Promise<{ ok: boolean; firstInvalidQuestion: SurveyQuestionId | null }> {
		if (destroyed || !canBeginSurveySubmit(status)) return { ok: false, firstInvalidQuestion: null };
		status = 'validating';
		errorMessage = '';
		successMessage = '';
		notify();

		const validation = validateSurvey(surveyQuestions, answers);
		if (validation.valid === false) {
			status = 'failed';
			fieldErrors = validation.fieldErrors;
			errorMessage = validation.message;
			notify();
			const firstInvalidQuestion = surveyQuestions.find((question) => fieldErrors[question.id])?.id ?? null;
			return { ok: false, firstInvalidQuestion };
		}

		status = 'submitting';
		fieldErrors = {};
		notify();
		try {
			await submitSurvey(mapSurveyResult(answers), submitter);
			if (destroyed) return { ok: false, firstInvalidQuestion: null };
			status = 'completed';
			successMessage = surveySuccessMessage;
			notify();
			return { ok: true, firstInvalidQuestion: null };
		} catch (error) {
			if (destroyed) return { ok: false, firstInvalidQuestion: null };
			status = 'failed';
			errorMessage = mapSurveySubmitError(error);
			notify();
			return { ok: false, firstInvalidQuestion: null };
		}
	}

	function setSubmitter(nextSubmitter?: SurveySubmitter) {
		submitter = nextSubmitter;
	}

	function reset() {
		if (destroyed) return;
		answers = createEmptySurveyAnswers();
		status = 'idle';
		errorMessage = '';
		successMessage = '';
		fieldErrors = {};
		currentPage = 0;
		notify();
	}

	function destroy() {
		destroyed = true;
		listeners.clear();
	}

	return { get snapshot() { return snapshot(); }, subscribe, setAnswer, next, back, submit, setSubmitter, reset, destroy };
}

export type SurveyController = ReturnType<typeof createSurveyController>;
