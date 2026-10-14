import { describe, expect, it } from 'vitest';
import {
	clampMonotonicProgress,
	projectStatusToDisplayState,
	shouldAcceptMonotonicStep,
	shouldApplyRuntimeTransition,
	shouldIgnoreStaleUpdate,
	shouldPreserveStableSnapshot
} from '../../src/lib/panoptes/utils/guards';

describe('analysis progress guards', () => {
	it('never decreases a confirmed step or progress percentage', () => {
		expect(shouldAcceptMonotonicStep(3, 2)).toBe(false);
		expect(shouldAcceptMonotonicStep(3, 3)).toBe(true);
		expect(clampMonotonicProgress(72, 45)).toBe(72);
		expect(clampMonotonicProgress(72, 88)).toBe(88);
	});

	it('rejects updates from another project, job, or analysis session', () => {
		const active = {
			activeProjectId: 'project-a',
			activeJobId: 'job-a',
			activeAnalysisSessionId: 'session-a',
			incomingProjectId: 'project-a',
			incomingJobId: 'job-a',
			incomingAnalysisSessionId: 'session-a'
		};

		expect(shouldIgnoreStaleUpdate(active)).toBe(false);
		expect(shouldIgnoreStaleUpdate({ ...active, incomingProjectId: 'project-b' })).toBe(true);
		expect(shouldIgnoreStaleUpdate({ ...active, incomingJobId: 'job-b' })).toBe(true);
		expect(shouldIgnoreStaleUpdate({ ...active, incomingAnalysisSessionId: 'session-b' })).toBe(
			true
		);
	});

	it('does not reopen a terminal runtime with a non-terminal transition', () => {
		expect(shouldApplyRuntimeTransition('completed', 'running')).toBe(false);
		expect(shouldApplyRuntimeTransition('failed', 'bootstrapping')).toBe(false);
		expect(shouldApplyRuntimeTransition('completed', 'completed')).toBe(true);
		expect(shouldApplyRuntimeTransition('running', 'completed')).toBe(true);
	});

	it('preserves the stable snapshot only while a new analysis is active', () => {
		expect(shouldPreserveStableSnapshot('running')).toBe(true);
		expect(shouldPreserveStableSnapshot('waiting_for_inference_confirmation')).toBe(true);
		expect(shouldPreserveStableSnapshot('completed')).toBe(false);
		expect(shouldPreserveStableSnapshot('failed')).toBe(false);
	});

	it('derives ready state from a committed snapshot before transient project status', () => {
		expect(
			projectStatusToDisplayState({
				projectStatus: 'analyzing',
				currentSnapshotId: 'snapshot-1',
				latestAnalysisJobId: 'job-1'
			})
		).toBe('ready');

		expect(
			projectStatusToDisplayState({
				projectStatus: 'failed',
				currentSnapshotId: null,
				latestAnalysisJobId: 'job-1'
			})
		).toBe('failed');
	});
});
