import { isTerminalMockJobStatus } from '$lib/features/analysis-job/mapping/analysis-job-status';
import type {
  IsoDateString,
  PanoptesAnalysisSnapshotPayload,
  PanoptesFailureCode,
  PanoptesInferenceDraft,
  PanoptesProjectRecord
} from '../../types';
import type { MockState, StoredJob } from './state';

export type RuntimeTickerDependencies = {
  createSnapshot: (
    project: PanoptesProjectRecord,
    draft: PanoptesInferenceDraft
  ) => PanoptesAnalysisSnapshotPayload;
  inferDraftFromUrl: (targetUrl: string) => PanoptesInferenceDraft;
  nowIso: () => IsoDateString;
  nowMs: () => number;
};

function moveJobToFailure(
  state: MockState,
  job: StoredJob,
  code: PanoptesFailureCode,
  message: string,
  deps: RuntimeTickerDependencies
): void {
  const { nowIso } = deps;
  const project = state.projects.find((item) => item.projectId === job.projectId);
  const timestamp = nowIso();

  job.status = code === 'snapshot_commit_failed' ? 'commit_failed' : 'failed';
  job.errorCode = code;
  job.errorMessage = message;
  job.statusMessage = message;
  job.finishedAt = timestamp;
  job.updatedAt = timestamp;

  if (project) {
    project.projectStatus = 'failed';
    project.updatedAt = timestamp;
  }
}

function commitSnapshotForJob(state: MockState, job: StoredJob, deps: RuntimeTickerDependencies): void {
  const { createSnapshot, inferDraftFromUrl, nowIso } = deps;
  const project = state.projects.find((item) => item.projectId === job.projectId);
  if (!project || project.latestAnalysisJobId !== job.analysisJobId) return;

  const snapshot = createSnapshot(project, job.inferenceDraft ?? inferDraftFromUrl(project.targetUrl));
  const timestamp = nowIso();

  state.snapshots.unshift(snapshot);
  project.currentSnapshotId = snapshot.analysisSnapshotId;
  project.currentStrategyPlanId = snapshot.strategyPlans.find((plan) => plan.isSelected)?.strategyPlanId ?? null;
  project.selectedStrategyKey = snapshot.strategyPlans.find((plan) => plan.isSelected)?.strategyKey ?? null;
  project.strategyStatusLabel = 'improving';
  project.projectStatus = 'ready';
  project.updatedAt = timestamp;

  job.status = 'completed';
  job.progressPercent = 100;
  job.progressPhase = 'strategy_synthesis';
  job.progressStepIndex = 5;
  job.statusMessage = 'snapshot 保存が完了しました。';
  job.finishedAt = timestamp;
  job.updatedAt = timestamp;
}

function tickJob(state: MockState, job: StoredJob, deps: RuntimeTickerDependencies): void {
  const { nowIso, nowMs } = deps;
  const project = state.projects.find((item) => item.projectId === job.projectId);
  if (!project || project.latestAnalysisJobId !== job.analysisJobId) return;
  if (isTerminalMockJobStatus(job.status)) return;

  if (job.status === 'awaiting_confirmation') {
    project.projectStatus = 'awaiting_confirmation';
    return;
  }

  const elapsedMs = nowMs() - new Date(job.phaseStartedAt).getTime();
  const timestamp = nowIso();

  if (job.progressPhase === 'target_scan') {
    project.projectStatus = 'analyzing';
    if (job.failureMode === 'url_unreachable' && elapsedMs > 2200) {
      moveJobToFailure(state, job, 'url_unreachable', 'URL にアクセスできませんでした。', deps);
      return;
    }

    job.progressPercent = elapsedMs < 1800 ? Math.min(74, 12 + Math.floor(elapsedMs / 45)) : 84;
    job.statusMessage = '分析対象 URL を分析中です…';
    job.updatedAt = timestamp;

    if (elapsedMs > 2600) {
      job.status = 'awaiting_confirmation';
      job.progressPhase = 'inference_review';
      job.progressStepIndex = 2;
      job.progressPercent = 100;
      job.statusMessage = '推定内容を確認してください。';
      job.updatedAt = timestamp;
      job.phaseStartedAt = timestamp;
      project.projectStatus = 'awaiting_confirmation';
      project.updatedAt = timestamp;
    }
    return;
  }

  if (job.progressPhase === 'competitor_analysis') {
    project.projectStatus = 'analyzing';
    job.progressPercent = elapsedMs < 2400 ? Math.min(92, 10 + Math.floor(elapsedMs / 35)) : 94;
    job.statusMessage = '競合を分析中です…';
    job.updatedAt = timestamp;

    if (elapsedMs > 2800) {
      job.progressPhase = 'industry_analysis';
      job.progressStepIndex = 4;
      job.progressPercent = 16;
      job.statusMessage = '業界構造を分析中です…';
      job.updatedAt = timestamp;
      job.phaseStartedAt = timestamp;
      project.updatedAt = timestamp;
    }
    return;
  }

  if (job.progressPhase === 'industry_analysis') {
    project.projectStatus = 'analyzing';
    if (job.failureMode === 'industry_analysis_failed' && elapsedMs > 2600) {
      moveJobToFailure(state, job, 'industry_analysis_failed', '業界構造の統合に失敗しました。', deps);
      return;
    }

    job.progressPercent = elapsedMs < 2400 ? Math.min(90, 18 + Math.floor(elapsedMs / 38)) : 95;
    job.statusMessage = '業界構造を分析中です…';
    job.updatedAt = timestamp;

    if (elapsedMs > 3000) {
      job.progressPhase = 'strategy_synthesis';
      job.progressStepIndex = 5;
      job.progressPercent = 26;
      job.statusMessage = '競合 × 業界 × 自社の差分を分析中です…';
      job.updatedAt = timestamp;
      job.phaseStartedAt = timestamp;
      project.projectStatus = 'completing';
      project.updatedAt = timestamp;
    }
    return;
  }

  if (job.progressPhase === 'strategy_synthesis') {
    project.projectStatus = 'completing';
    if (elapsedMs < 2600) {
      job.status = 'running';
      job.progressPercent = Math.min(90, 28 + Math.floor(elapsedMs / 40));
      job.statusMessage = '競合 × 業界 × 自社の差分を分析中です…';
      job.updatedAt = timestamp;
      return;
    }

    job.status = 'completing';
    job.progressPercent = Math.min(98, 88 + Math.floor((elapsedMs - 2600) / 120));
    job.statusMessage = 'snapshot を保存しています…';
    job.updatedAt = timestamp;

    if (job.failureMode === 'snapshot_commit_failed' && elapsedMs > 4200) {
      moveJobToFailure(state, job, 'snapshot_commit_failed', '分析結果の保存中に問題が発生しました。', deps);
      return;
    }

    if (elapsedMs > 4600) {
      commitSnapshotForJob(state, job, deps);
    }
  }
}

export function tickAllMockJobs(state: MockState, deps: RuntimeTickerDependencies): MockState {
  state.jobs.forEach((job) => tickJob(state, job, deps));
  return state;
}
