import type { PanoptesApiClient } from '../types';
import { PanoptesApiError } from '../utils/errors';

function unavailable(): never {
	throw new PanoptesApiError(
		'The canonical Panoptes business API is not available in the current Rails application.',
		{
			code: 'business_api_unavailable',
			status: 503,
			retryable: true
		}
	);
}

export const unavailableCanonicalBusinessClient: PanoptesApiClient = {
	listProjects: async () => unavailable(),
	getProjectDetail: async () => unavailable(),
	createAndStartAnalysis: async () => unavailable(),
	pollAnalysisProgress: async () => unavailable(),
	confirmInference: async () => unavailable(),
	reanalyzeProject: async () => unavailable(),
	selectStrategy: async () => unavailable(),
	updateTaskStatus: async () => unavailable(),
	getUsageState: async () => unavailable()
};
