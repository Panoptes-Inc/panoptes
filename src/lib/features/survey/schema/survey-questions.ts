import type { SurveyAnswers, SurveyQuestion } from '../types';

export const surveyQuestions: readonly SurveyQuestion[] = [
	{
		id: 'purpose',
		type: 'single_choice',
		title: '主な利用目的',
		required: true,
		options: [
			{ value: 'strategy', label: '戦略検討' },
			{ value: 'ui-feedback', label: 'UI・UXフィードバック' },
			{ value: 'feature-request', label: '機能要望' }
		]
	},
	{
		id: 'projectType',
		type: 'text',
		title: '対象プロジェクトや想定業種',
		placeholder: '例：SaaS / サービスサイト',
		required: false
	},
	{
		id: 'comment',
		type: 'text',
		title: '聞きたいこと / 改善したいこと',
		placeholder: '自由にご記入ください',
		multiline: true,
		required: true
	},
	{
		id: 'email',
		type: 'email',
		title: '返信用メールアドレス',
		placeholder: 'name@example.com',
		required: true
	}
] as const;

export function createEmptySurveyAnswers(): SurveyAnswers {
	return { purpose: '', projectType: '', comment: '', email: '' };
}

// The existing survey renders every question on one page; no step UI is introduced in B-3B.
export const surveyPageCount = 1;
