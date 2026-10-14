import type { SurveyStatus } from '../types';

export function canBeginSurveySubmit(status: SurveyStatus): boolean {
	return status !== 'submitting';
}

export function retryableSurveyStatus(status: SurveyStatus): SurveyStatus {
	return status === 'failed' ? 'answering' : status;
}
