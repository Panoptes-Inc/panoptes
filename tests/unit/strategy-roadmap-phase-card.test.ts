import { describe, expect, it } from 'vitest';
import {
	ROADMAP_TASK_STATUS_ACTIONS,
	nextChecklistTaskStatus,
	roadmapStatusActionLabel,
	roadmapTaskStatusLabel,
	roadmapTaskStatusTone
} from '../../src/lib/components/ComponentsBase/Strategy/data/roadmap-phase-presentation';
import { createStrategyAnalysisViewModel } from '../../src/lib/components/ComponentsBase/Strategy/data/strategy-analysis-view-model';
import { dummySnapshot } from '../../src/lib/db/dummy/panoptes_dummy_ui';
import type { PanoptesPhaseTaskStatus, PanoptesStrategyData } from '../../src/lib/panoptes/types';

const statuses: PanoptesPhaseTaskStatus[] = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];

function selectedPlanTasks() {
	const selectedPlanId = dummySnapshot.strategyPlans.find(
		(plan) => plan.isSelected
	)?.strategyPlanId;
	return dummySnapshot.phaseTasks.filter((task) => task.strategyPlanId === selectedPlanId);
}

describe('roadmap phase presentation mapping', () => {
	it('maps every task status to non-empty task and action labels', () => {
		for (const status of statuses) {
			expect(roadmapTaskStatusLabel(status)).not.toBe('');
			expect(roadmapStatusActionLabel(status)).not.toBe('');
			expect(roadmapTaskStatusTone(status)).toMatch(/^#[0-9a-f]{6}$/);
		}
	});

	it('keeps the established status action set and ordering', () => {
		expect(ROADMAP_TASK_STATUS_ACTIONS).toEqual(['todo', 'in_progress', 'done', 'blocked']);
	});

	it('toggles a completed checklist task back to todo and other states to done', () => {
		expect(nextChecklistTaskStatus('done')).toBe('todo');
		for (const status of statuses.filter((item) => item !== 'done')) {
			expect(nextChecklistTaskStatus(status)).toBe('done');
		}
	});
});

describe('roadmap phase view model', () => {
	it('builds the 30/60/90 presentation in product order', () => {
		const model = createStrategyAnalysisViewModel({
			strategy: dummySnapshot.strategy,
			plans: dummySnapshot.strategyPlans,
			allTasks: selectedPlanTasks()
		});

		expect(model.roadmap.phases.map((phase) => phase.phase)).toEqual([
			'day_30',
			'day_60',
			'day_90'
		]);
		expect(model.roadmap.projectDayMax).toBe(90);
	});

	it('sorts tasks and derives progress, checked, and active display state', () => {
		const tasks = selectedPlanTasks();
		const selectedTask = tasks.find((task) => task.phaseCode === 'day_30')!;
		const model = createStrategyAnalysisViewModel({
			strategy: dummySnapshot.strategy,
			plans: dummySnapshot.strategyPlans,
			allTasks: [...tasks].reverse(),
			selectedPhase: 'day_30',
			selectedTaskId: selectedTask.phaseTaskId
		});
		const phase = model.roadmap.phases[0]!;

		expect(phase.tasks.map((task) => task.phaseTaskId)).toEqual(
			phase.tasks
				.toSorted((left, right) => {
					const sourceLeft = tasks.find((task) => task.phaseTaskId === left.phaseTaskId)!;
					const sourceRight = tasks.find((task) => task.phaseTaskId === right.phaseTaskId)!;
					return sourceLeft.sortOrder - sourceRight.sortOrder;
				})
				.map((task) => task.phaseTaskId)
		);
		expect(phase.activeTask?.phaseTaskId).toBe(selectedTask.phaseTaskId);
		expect(phase.tasks.every((task) => task.isChecked === (task.status === 'done'))).toBe(true);
		expect(phase.completionPercent).toBeGreaterThanOrEqual(0);
		expect(phase.completionPercent).toBeLessThanOrEqual(100);
	});

	it('keeps empty task collections renderable', () => {
		const model = createStrategyAnalysisViewModel({
			strategy: dummySnapshot.strategy,
			allTasks: []
		});

		expect(model.roadmap.phases).toHaveLength(3);
		expect(model.roadmap.phases.every((phase) => phase.tasks.length === 0)).toBe(true);
		expect(model.roadmap.phases.every((phase) => phase.activeTask === null)).toBe(true);
		expect(model.roadmap.phases.every((phase) => phase.completionPercent === 0)).toBe(true);
	});

	it('uses display-safe fallbacks for malformed optional phase copy', () => {
		const malformedStrategy: PanoptesStrategyData = {
			...dummySnapshot.strategy,
			planPhases: dummySnapshot.strategy.planPhases.map((phase, index) =>
				index === 0
					? {
							...phase,
							title: '縺薙ｌ縺ｯ譁・ｭ怜喧縺代〒縺吶',
							objective: '',
							progressLabel: '',
							progressCountLabel: '',
							nextAction: ''
						}
					: phase
			)
		};
		const phase = createStrategyAnalysisViewModel({
			strategy: malformedStrategy,
			allTasks: []
		}).roadmap.phases[0]!;

		expect(phase.title).not.toContain('縺');
		expect(phase.objective).not.toBe('');
		expect(phase.progressLabel).not.toBe('');
		expect(phase.progressCountLabel).toBe('0/0');
		expect(phase.nextAction).not.toBe('');
	});

	it('preserves valid long task text without component-owned truncation', () => {
		const longTitle = '比較検討ユーザー向けの導線を検証し改善候補を優先順位付きで整理する'.repeat(
			3
		);
		const [first, ...rest] = selectedPlanTasks();
		const model = createStrategyAnalysisViewModel({
			strategy: dummySnapshot.strategy,
			allTasks: [{ ...first!, title: longTitle }, ...rest]
		});

		expect(model.roadmap.phases.flatMap((phase) => phase.tasks)[0]?.title).toBe(longTitle);
	});
});
