import { dummySnapshot } from '$lib/db/dummy/panoptes_dummy_ui';
import type { PanoptesIndustryData } from '$lib/panoptes/types';

export type IndustryAnalysisViewModel = PanoptesIndustryData;

export function createIndustryAnalysisViewModel({
  data
}: {
  data?: PanoptesIndustryData | null;
}): IndustryAnalysisViewModel {
  return data ?? dummySnapshot.industry;
}

export const dummyIndustryAnalysisViewModel = createIndustryAnalysisViewModel({
  data: dummySnapshot.industry
});
