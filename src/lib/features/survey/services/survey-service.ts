import type { SurveyPayload, SurveySubmitter } from '../types';

// There is no Survey API in the repository. The optional parent callback remains the only submission port.
export async function submitSurvey(payload: SurveyPayload, submitter?: SurveySubmitter): Promise<void> {
	if (submitter) await submitter(payload);
}
