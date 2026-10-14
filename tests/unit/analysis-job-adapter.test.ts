import { describe, expect, it, vi } from 'vitest';
import {
	adaptCanonicalAnalysisJob,
	adaptFrontendPollProgress,
	adaptMockAnalysisJob,
	mapCanonicalStateToFrontendStatus,
	resolveAnalysisPollingDecision
} from '../../src/lib/features/analysis-job/adapter/analysis-job-adapter';
import {
	isTerminalAnalysisRuntimeStatus,
	isTerminalCanonicalAnalysisJobState,
	isTerminalFrontendJobStatus
} from '../../src/lib/features/analysis-job/mapping/analysis-job-status';
import type { CanonicalAnalysisJobState } from '../../src/lib/features/analysis-job/types';
import type {
	PanoptesAnalysisJob,
	PanoptesAnalysisJobStatus,
	PanoptesPollProgressResult
} from '../../src/lib/panoptes/types';
import { resolveTerminalReasonFromProgressStatus } from '../../src/lib/panoptes/domain/runtime-progress';

const NOW = '2026-08-17T00:00:00.000Z';

function canonicalJob(status: unknown, patch: Record<string, unknown> = {}) {
	return {
		id: 'job-1',
		organization_id: 'org-1',
		project_id: 'project-1',
		status,
		phase: status,
		progress_percent: 42,
		retryable: false,
		error: null,
		committed_snapshot_id: null,
		started_at: NOW,
		finished_at: null,
		created_at: NOW,
		updated_at: NOW,
		...patch
	};
}

function frontendJob(status: PanoptesAnalysisJobStatus): PanoptesAnalysisJob {
	return {
		analysisJobId: 'job-1',
		projectId: 'project-1',
		orgId: 'org-1',
		analysisSessionId: 'session-1',
		idempotencyKey: 'key-1',
		status,
		progressPhase: 'target_scan',
		progressStepIndex: 1,
		progressPercent: 42,
		statusMessage: 'processing',
		errorCode: null,
		errorMessage: null,
		inferenceLocked: false,
		inferenceConfirmedAt: null,
		startedAt: NOW,
		finishedAt: null,
		createdAt: NOW,
		updatedAt: NOW
	};
}

function pollResult(status: PanoptesAnalysisJobStatus): PanoptesPollProgressResult {
	return {
		progressState: {
			projectId: 'project-1',
			analysisJobId: 'job-1',
			analysisSessionId: 'session-1',
			status,
			progressPhase: 'target_scan',
			progressStepIndex: 1,
			progressPercent: 42,
			statusMessage: 'processing',
			errorCode: null,
			errorMessage: null,
			inferenceLocked: false,
			inferenceConfirmedAt: null,
			startedAt: NOW,
			finishedAt: null,
			updatedAt: NOW
		},
		uiStepPanel: {
			visibleStep: 'target_scan',
			visibleStepIndex: 1,
			serverConfirmedPhase: 'target_scan',
			serverConfirmedStepIndex: 1,
			progressPercent: 42,
			statusMessage: 'processing',
			canAutoAdvance: true,
			panelTransitionLocked: false,
			preserveContainerMount: true,
			preserveMinHeight: true
		},
		runtimeState: {
			runtimeState: 'running',
			projectId: 'project-1',
			analysisJobId: 'job-1',
			currentPhase: 'target_scan',
			currentStepIndex: 1,
			failure: null
		},
		projectSummary: {
			projectId: 'project-1',
			orgId: 'org-1',
			projectName: 'Project',
			targetUrl: 'https://example.com',
			normalizedTargetUrl: 'https://example.com',
			projectStatus: 'analyzing',
			displayState: 'analyzing',
			currentSnapshotId: null,
			latestAnalysisJobId: 'job-1',
			latestAnalysisSessionId: 'session-1',
			currentStrategyPlanId: null,
			selectedStrategyKey: null,
			strategyStatusLabel: null,
			latestJobStatus: status,
			latestProgressPhase: 'target_scan',
			latestProgressStepIndex: 1,
			latestProgressPercent: 42,
			latestStatusMessage: 'processing',
			latestErrorCode: null,
			createdAt: NOW,
			updatedAt: NOW
		},
		inferenceDraft: null,
		currentSnapshotReady: false,
		staleResponseIgnored: false
	};
}

describe('canonical analysis job adapter', () => {
	it.each([
		['queued', 'running'],
		['preparing', 'running'],
		['crawling', 'running'],
		['capturing', 'running'],
		['internal_analysis', 'running'],
		['awaiting_confirmation', 'awaiting_confirmation'],
		['visual_analysis', 'running'],
		['llm_analysis', 'running'],
		['finalizing', 'running'],
		['completed', 'completed'],
		['failed', 'failed'],
		['cancelled', 'cancelled'],
		['timed_out', 'timed_out'],
		['partially_completed', 'partially_completed']
	] as const)('maps %s to %s', (canonical, runtime) => {
		const result = adaptCanonicalAnalysisJob(canonicalJob(canonical));

		expect(result.status).toBe(runtime);
		expect(result.phase).toBe(canonical);
		expect(result.terminal).toBe(isTerminalAnalysisRuntimeStatus(runtime));
	});

	it.each(['completed', 'failed', 'cancelled', 'timed_out', 'partially_completed'] as const)(
		'treats %s as canonical terminal',
		(status) => {
			expect(isTerminalCanonicalAnalysisJobState(status)).toBe(true);
			expect(isTerminalFrontendJobStatus(status)).toBe(true);
		}
	);

	it('keeps running and awaiting confirmation non-terminal', () => {
		expect(isTerminalCanonicalAnalysisJobState('crawling')).toBe(false);
		expect(isTerminalCanonicalAnalysisJobState('awaiting_confirmation')).toBe(false);
		expect(isTerminalFrontendJobStatus('running')).toBe(false);
		expect(isTerminalFrontendJobStatus('awaiting_confirmation')).toBe(false);
	});

	it('maps progress, timestamps, retryability, partial result and committed snapshot without inventing fields', () => {
		const result = adaptCanonicalAnalysisJob(
			canonicalJob('partially_completed', {
				progress_percent: 105,
				retryable: true,
				committed_snapshot_id: 'snapshot-1',
				finished_at: NOW
			})
		);

		expect(result).toMatchObject({
			progressPercent: 100,
			updatedAt: NOW,
			finishedAt: NOW,
			retryable: true,
			partial: true,
			committedSnapshotId: 'snapshot-1',
			confirmationRequired: false
		});
	});

	it('fails safely for an unknown status', () => {
		const onDiagnostic = vi.fn();
		const result = adaptCanonicalAnalysisJob(canonicalJob('provider_specific_state'), {
			onDiagnostic
		});

		expect(result).toMatchObject({
			status: 'failed',
			terminal: true,
			diagnostic: 'unknown_status'
		});
		expect(result.failure?.message).not.toContain('provider_specific_state');
		expect(onDiagnostic).toHaveBeenCalledWith('unknown_status');
	});

	it('fails safely for a missing status', () => {
		const input = canonicalJob('queued');
		delete input.status;

		expect(adaptCanonicalAnalysisJob(input).diagnostic).toBe('missing_status');
	});

	it('fails safely for a malformed response', () => {
		expect(adaptCanonicalAnalysisJob(null)).toMatchObject({
			status: 'failed',
			terminal: true,
			diagnostic: 'malformed_response'
		});
	});

	it('does not accept mock commit_failed as a canonical state', () => {
		expect(adaptCanonicalAnalysisJob(canonicalJob('commit_failed')).diagnostic).toBe(
			'unknown_status'
		);
	});
});

describe('frontend and mock boundary', () => {
	it('keeps commit_failed inside the mock and exposes failed with the existing failure code', () => {
		const result = adaptMockAnalysisJob({ ...frontendJob('failed'), status: 'commit_failed' });

		expect(result).toMatchObject({ status: 'failed', errorCode: 'snapshot_commit_failed' });
		expect(resolveTerminalReasonFromProgressStatus(result.status, null, result.errorCode)).toBe(
			'commit_failed'
		);
	});

	it.each([
		['queued', 'queued'],
		['preparing', 'running'],
		['finalizing', 'completing'],
		['timed_out', 'timed_out'],
		['partially_completed', 'partially_completed']
	] as Array<[CanonicalAnalysisJobState, PanoptesAnalysisJobStatus]>)(
		'maps canonical %s to frontend %s',
		(canonical, frontend) => {
			expect(mapCanonicalStateToFrontendStatus(canonical)).toBe(frontend);
		}
	);

	it.each(['completed', 'failed', 'cancelled', 'timed_out', 'partially_completed'] as const)(
		'stops polling for %s',
		(status) => {
			expect(resolveAnalysisPollingDecision(status, false)).toBe('stop');
		}
	);

	it.each(['queued', 'running', 'awaiting_confirmation', 'completing'] as const)(
		'continues polling for %s',
		(status) => {
			expect(resolveAnalysisPollingDecision(status, false)).toBe('continue');
		}
	);

	it('normalizes timed_out to the existing safe failed UI and stops polling', () => {
		const result = adaptFrontendPollProgress(pollResult('timed_out'));

		expect(result.runtimeState.runtimeState).toBe('failed');
		expect(result.runtimeState.failure?.code).toBe('job_timed_out');
		expect(resolveAnalysisPollingDecision(result.progressState.status, false)).toBe('stop');
	});

	it('normalizes partially_completed to the existing completed UI and stops polling', () => {
		const result = adaptFrontendPollProgress(pollResult('partially_completed'));

		expect(result.runtimeState.runtimeState).toBe('completed');
		expect(resolveAnalysisPollingDecision(result.progressState.status, false)).toBe('stop');
	});

	it('uses the confirmation polling interval contract without marking it terminal', () => {
		const result = adaptFrontendPollProgress(pollResult('awaiting_confirmation'));

		expect(result.runtimeState.runtimeState).toBe('awaiting_confirmation');
		expect(resolveAnalysisPollingDecision(result.progressState.status, false)).toBe('continue');
	});
});
