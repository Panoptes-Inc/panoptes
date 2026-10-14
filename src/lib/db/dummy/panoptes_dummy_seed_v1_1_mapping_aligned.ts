// Panoptes Dummy Seed v1.1 Mapping Aligned
// Source of truth is panoptes_dummy_seed_v1_1_mapping_aligned.json
// This adapter keeps frontend imports typed and convenient.

import seed from './panoptes_dummy_seed_v1_1_mapping_aligned.json';

export const panoptesDummySeedMappingAligned = seed;

export type PanoptesDummySeedMappingAligned = typeof panoptesDummySeedMappingAligned;

export const getProjectListItems = () => panoptesDummySeedMappingAligned.projectList.items;

export const getProjectListItemById = (projectId: string) =>
  panoptesDummySeedMappingAligned.projectList.items.find((item) => item.projectId === projectId) ?? null;

export const getAnalysisJobById = (analysisJobId: string) =>
  panoptesDummySeedMappingAligned.analysisJobs.find((job) => job.analysisJobId === analysisJobId) ?? null;

export const getVisibleStepItem = (visibleStepKey: string) =>
  panoptesDummySeedMappingAligned.analysisFlow.visibleStepItems.find(
    (item) => item.visibleStepKey === visibleStepKey
  ) ?? null;

export default panoptesDummySeedMappingAligned;
