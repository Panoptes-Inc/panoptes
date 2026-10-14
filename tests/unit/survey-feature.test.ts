import { describe, expect, it, vi } from 'vitest';
import {
	isFinalSurveyPage,
	nextSurveyPage,
	previousSurveyPage,
	surveyProgress
} from '../../src/lib/features/survey/navigation/survey-navigation';
import { surveyQuestions } from '../../src/lib/features/survey/schema/survey-questions';
import { createSurveyController } from '../../src/lib/features/survey/state/survey-controller';
import type { SurveyQuestion, SurveySnapshot } from '../../src/lib/features/survey/types';
import { mapSurveyResult } from '../../src/lib/features/survey/utils/survey-result-mapper';
import {
	normalizeSurveyAnswer,
	validateSurvey,
	validateSurveyAnswer
} from '../../src/lib/features/survey/validation/survey-validation';

function answerValidSurvey(controller: ReturnType<typeof createSurveyController>) {
	controller.setAnswer('purpose', 'strategy');
	controller.setAnswer('projectType', ' SaaS ');
	controller.setAnswer('comment', ' 改善したい点 ');
	controller.setAnswer('email', ' USER@example.com ');
}

describe('survey validation and result mapping', () => {
	it('rejects unanswered required questions but permits an unanswered optional question', () => {
		const required = validateSurveyAnswer(surveyQuestions[0], '');
		const optional = validateSurveyAnswer(surveyQuestions[1], '');
		expect(required).toMatchObject({ valid: false, code: 'required' });
		expect(optional).toEqual({ valid: true });
	});

	it('accepts a known single choice and rejects an unknown option', () => {
		expect(validateSurveyAnswer(surveyQuestions[0], 'strategy')).toEqual({ valid: true });
		expect(validateSurveyAnswer(surveyQuestions[0], 'unknown')).toMatchObject({
			valid: false,
			code: 'invalid_option'
		});
	});

	it('validates multiple choice options and maximum selections', () => {
		const question: SurveyQuestion = {
			id: 'purpose',
			type: 'multiple_choice',
			title: '目的',
			required: true,
			maxSelections: 1,
			options: [
				{ value: 'a', label: 'A' },
				{ value: 'b', label: 'B' }
			]
		};
		expect(validateSurveyAnswer(question, ['a'])).toEqual({ valid: true });
		expect(validateSurveyAnswer(question, ['a', 'b'])).toMatchObject({
			valid: false,
			code: 'too_many_selections'
		});
		expect(validateSurveyAnswer(question, ['x'])).toMatchObject({
			valid: false,
			code: 'invalid_option'
		});
	});

	it('normalizes text and maps the historical callback payload', () => {
		expect(normalizeSurveyAnswer('  text  ')).toBe('text');
		expect(
			mapSurveyResult({
				purpose: ' strategy ',
				projectType: ' SaaS ',
				comment: ' comment ',
				email: ' USER@Example.com '
			})
		).toEqual({
			purpose: 'strategy',
			projectType: 'SaaS',
			comment: 'comment',
			email: 'user@example.com'
		});
	});

	it('rejects invalid email and an unknown question', () => {
		expect(validateSurveyAnswer(surveyQuestions[3], 'invalid')).toMatchObject({
			valid: false,
			code: 'invalid_email'
		});
		expect(validateSurveyAnswer(undefined, 'value')).toMatchObject({
			valid: false,
			code: 'unknown_question'
		});
	});

	it('validates the complete survey without requiring the optional project type', () => {
		const result = validateSurvey(surveyQuestions, {
			purpose: 'strategy',
			projectType: '',
			comment: 'comment',
			email: 'user@example.com'
		});
		expect(result.valid).toBe(true);
	});
});

describe('survey navigation', () => {
	it('calculates next, back, final page, and progress', () => {
		expect(nextSurveyPage(0, 3)).toBe(1);
		expect(previousSurveyPage(1, 3)).toBe(0);
		expect(previousSurveyPage(0, 3)).toBe(0);
		expect(isFinalSurveyPage(2, 3)).toBe(true);
		expect(surveyProgress(0, 4)).toBe(25);
		expect(surveyProgress(3, 4)).toBe(100);
	});

	it('keeps the existing one-page survey on its final page', () => {
		expect(nextSurveyPage(0, 1)).toBe(0);
		expect(previousSurveyPage(0, 1)).toBe(0);
		expect(isFinalSurveyPage(0, 1)).toBe(true);
		expect(surveyProgress(0, 1)).toBe(100);
	});
});

describe('survey controller', () => {
	it('starts idle and records answer additions and changes', () => {
		const controller = createSurveyController();
		expect(controller.snapshot.status).toBe('idle');
		expect(controller.snapshot.progress).toBe(100);
		controller.setAnswer('purpose', 'strategy');
		expect(controller.snapshot.answers.purpose).toBe('strategy');
		controller.setAnswer('purpose', 'feature-request');
		expect(controller.snapshot.answers.purpose).toBe('feature-request');
		controller.destroy();
	});

	it('retains answers across back navigation', () => {
		const controller = createSurveyController();
		controller.setAnswer('comment', 'keep me');
		controller.back();
		expect(controller.snapshot.answers.comment).toBe('keep me');
		controller.destroy();
	});

	it('reports validation failure before submission', async () => {
		const submitter = vi.fn();
		const controller = createSurveyController(submitter);
		const result = await controller.submit();
		expect(result).toMatchObject({ ok: false, firstInvalidQuestion: 'purpose' });
		expect(controller.snapshot.status).toBe('failed');
		expect(submitter).not.toHaveBeenCalled();
		controller.destroy();
	});

	it('prevents duplicate submit and completes once', async () => {
		let resolveSubmit: (() => void) | undefined;
		const submitter = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveSubmit = resolve;
				})
		);
		const controller = createSurveyController(submitter);
		answerValidSurvey(controller);
		const first = controller.submit();
		expect(controller.snapshot.status).toBe('submitting');
		await expect(controller.submit()).resolves.toEqual({ ok: false, firstInvalidQuestion: null });
		resolveSubmit?.();
		await expect(first).resolves.toEqual({ ok: true, firstInvalidQuestion: null });
		expect(controller.snapshot.status).toBe('completed');
		expect(submitter).toHaveBeenCalledTimes(1);
		controller.destroy();
	});

	it('moves failed state back to answering and can retry', async () => {
		const submitter = vi
			.fn()
			.mockRejectedValueOnce(new Error('temporary failure'))
			.mockResolvedValueOnce(undefined);
		const controller = createSurveyController(submitter);
		answerValidSurvey(controller);
		await controller.submit();
		expect(controller.snapshot).toMatchObject({
			status: 'failed',
			errorMessage: 'temporary failure'
		});
		controller.setAnswer('comment', 'retry');
		expect(controller.snapshot.status).toBe('answering');
		await controller.submit();
		expect(controller.snapshot.status).toBe('completed');
		controller.destroy();
	});

	it('reset clears answers and keeps close/reopen preservation as an explicit caller choice', () => {
		const controller = createSurveyController();
		controller.setAnswer('comment', 'answer');
		controller.reset();
		expect(controller.snapshot).toMatchObject({ status: 'idle', answers: { comment: '' } });
		controller.destroy();
	});

	it('does not publish async completion after destroy', async () => {
		let resolveSubmit: (() => void) | undefined;
		const controller = createSurveyController(
			() =>
				new Promise<void>((resolve) => {
					resolveSubmit = resolve;
				})
		);
		answerValidSurvey(controller);
		const snapshots: SurveySnapshot[] = [];
		controller.subscribe((snapshot) => snapshots.push(snapshot));
		const pending = controller.submit();
		controller.destroy();
		resolveSubmit?.();
		await pending;
		expect(snapshots.at(-1)?.status).toBe('submitting');
	});
});
