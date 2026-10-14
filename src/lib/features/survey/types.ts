export type SurveyQuestionId = 'purpose' | 'projectType' | 'comment' | 'email';
export type SurveyOption = { value: string; label: string };

type BaseQuestion = {
	id: SurveyQuestionId;
	title: string;
	description?: string;
	required: boolean;
};

export type SurveyQuestion =
	| (BaseQuestion & {
			type: 'single_choice' | 'multiple_choice';
			options: SurveyOption[];
			maxSelections?: number;
	  })
	| (BaseQuestion & {
			type: 'text' | 'email';
			placeholder?: string;
			multiline?: boolean;
			minLength?: number;
			maxLength?: number;
	  });

export type SurveyAnswerValue = string | string[] | null;
export type SurveyAnswers = Record<SurveyQuestionId, SurveyAnswerValue>;
export type SurveyFieldErrors = Partial<Record<SurveyQuestionId, string>>;

export type SurveyPayload = {
	purpose: string;
	projectType: string;
	comment: string;
	email: string;
};

export type SurveyStatus = 'idle' | 'answering' | 'validating' | 'submitting' | 'completed' | 'failed';

export type SurveySnapshot = {
	answers: SurveyAnswers;
	status: SurveyStatus;
	errorMessage: string;
	successMessage: string;
	fieldErrors: SurveyFieldErrors;
	currentPage: number;
	pageCount: number;
	progress: number;
	canGoBack: boolean;
	canGoNext: boolean;
	canSubmit: boolean;
};

export type SurveySubmitter = (payload: SurveyPayload) => void | Promise<void>;
