<script lang="ts">
	import { onMount } from 'svelte';
	import type { PanoptesAnalysisSnapshotPayload } from '$lib/panoptes/types';
	import PanoptesShellMainSurface from '$lib/features/panoptes-shell/components/PanoptesShellMainSurface.svelte';
	import { createDefaultPanoptesShellController } from '$lib/features/panoptes-shell/controller/panoptes-shell-controller-adapter';
	import {
		buildShellHeaderMeta,
		isReanalyzeDisabled,
		resolveSelectedCompetitorId,
		selectStrategyTasks,
		SNAPSHOT_TABS,
		type SnapshotTabId
	} from '$lib/features/panoptes-shell/mapping/shell-view-model';
	import { notificationStore } from '$lib/panoptes/stores/notifications';
	import { projectCollectionStore, projectDetailStore } from '$lib/panoptes/stores/projects';
	import { analysisRuntimeStore } from '$lib/panoptes/stores/runtime';
	import { sessionUiStore } from '$lib/panoptes/stores/session';
	import { strategyUiStore } from '$lib/panoptes/stores/strategy';
	import {
		analysisOverlayMode,
		currentRenderableSnapshot,
		mainSurfaceRenderMode,
		selectedSnapshotStrategyPlan,
		whitePanelPresentation
	} from '$lib/panoptes/selectors/presentation';
	import PanoptesCreateProjectSheet from './shared/PanoptesCreateProjectSheet.svelte';
	import PanoptesHeaderMeta from './shared/PanoptesHeaderMeta.svelte';
	import PanoptesTabNav from './shared/PanoptesTabNav.svelte';
	import PanoptesToastStack from './shared/PanoptesToastStack.svelte';

	let {
		fallbackSnapshot = null,
		organizationId = null
	}: {
		fallbackSnapshot?: PanoptesAnalysisSnapshotPayload | null;
		organizationId?: string | null;
	} = $props();

	const controller = createDefaultPanoptesShellController(
		() => fallbackSnapshot,
		() => organizationId
	);

	let activeTab = $state<SnapshotTabId>('strategy');
	let selectedCompetitorId = $state<string | null>(null);
	let draftUrl = $state('');
	let draftName = $state('');

	const entryFallbackSnapshot = $derived(!$currentRenderableSnapshot ? fallbackSnapshot : null);
	const snapshotSurfaceData = $derived($currentRenderableSnapshot ?? entryFallbackSnapshot);
	const isFallbackSnapshotActive = $derived(Boolean(entryFallbackSnapshot));
	const snapshotStrategyTasks = $derived(
		selectStrategyTasks(snapshotSurfaceData, $selectedSnapshotStrategyPlan)
	);
	const reanalyzeDisabled = $derived(
		isReanalyzeDisabled($projectDetailStore.project, $analysisRuntimeStore)
	);
	const headerMeta = $derived(
		buildShellHeaderMeta(snapshotSurfaceData, $projectDetailStore.project)
	);

	$effect(() => {
		if (!snapshotSurfaceData) return;
		controller.syncSnapshot(snapshotSurfaceData);
		selectedCompetitorId = resolveSelectedCompetitorId(
			snapshotSurfaceData,
			selectedCompetitorId
		);
	});

	onMount(controller.mount);

	async function handleCreateFromSheet(): Promise<void> {
		const created = await controller.createProject({ targetUrl: draftUrl, projectName: draftName });
		if (!created) return;

		draftUrl = '';
		draftName = '';
		activeTab = 'strategy';
		selectedCompetitorId = null;
	}
</script>

<div class="panoptes-shell">
	<header class="shell-top">
		<PanoptesTabNav
			tabs={SNAPSHOT_TABS}
			{activeTab}
			onChange={(tabId) => (activeTab = tabId as SnapshotTabId)}
		/>
		<PanoptesHeaderMeta
			meta={headerMeta}
			reanalyzeDisabled={reanalyzeDisabled}
			onReanalyze={controller.retryAnalysis}
		/>
	</header>

	<div class="shell-body">
		<PanoptesShellMainSurface
			fallbackActive={isFallbackSnapshotActive}
			renderMode={$mainSurfaceRenderMode}
			overlayMode={$analysisOverlayMode}
			snapshot={snapshotSurfaceData}
			{activeTab}
			projects={$projectCollectionStore.items}
			selectedProjectId={$sessionUiStore.selectedProjectId}
			{selectedCompetitorId}
			selectedPlan={$selectedSnapshotStrategyPlan}
			strategyTasks={snapshotStrategyTasks}
			selectedPhase={$strategyUiStore.selectedPhase ?? 'day_30'}
			selectedTaskId={$strategyUiStore.selectedTaskId}
			runtime={$analysisRuntimeStore}
			presentation={$whitePanelPresentation}
			inferenceDraft={$analysisRuntimeStore.inferenceDraft}
			taskMutationStatus={$strategyUiStore.taskMutationStatus}
			strategySelectionStatus={$strategyUiStore.strategySelectionStatus}
			onSelectCompetitor={(competitorId) => (selectedCompetitorId = competitorId)}
			onSelectPhase={controller.selectPhase}
			onSelectTask={controller.selectTask}
			onUpdateTaskStatus={controller.updateTaskStatus}
			onSelectStrategyKey={controller.selectStrategy}
			onSelectProject={controller.selectProject}
			onCreateProject={controller.openCreateFlow}
			onIndustryInput={(value) => controller.updateInferenceDraft({ inferredIndustry: value })}
			onStructureInput={(value) =>
				controller.updateInferenceDraft({ inferredStructureType: value })}
			onScaleInput={(value) => controller.updateInferenceDraft({ inferredSiteScale: value })}
			onConfirm={controller.confirmInference}
			onRetry={controller.retryAnalysis}
		/>
	</div>

	<PanoptesCreateProjectSheet
		open={$sessionUiStore.createFlowOpen}
		{draftUrl}
		{draftName}
		submitDisabled={$sessionUiStore.createFlowStatus === 'submitting'}
		onUrlInput={(value) => (draftUrl = value)}
		onNameInput={(value) => (draftName = value)}
		onClose={controller.closeCreateFlow}
		onSubmit={handleCreateFromSheet}
	/>

	<PanoptesToastStack toasts={$notificationStore.toasts} />
</div>

<style>
	.panoptes-shell {
		width: min(1680px, 100%);
		margin: 0 auto;
		display: grid;
		gap: 16px;
	}

	.shell-top {
		display: flex;
		gap: 16px;
		align-items: center;
		justify-content: space-between;
	}

	.shell-body {
		display: grid;
		gap: 16px;
		align-items: start;
		padding: 8px;
		box-shadow: 0 0 4px #00000016;
		background: #ffffff;
		border-radius: 8px;
	}

	@media (max-width: 720px) {
		.panoptes-shell {
			padding-inline: 12px;
		}
	}

	@media (max-height: 980px) {
		.panoptes-shell {
			zoom: 0.88;
		}
	}
</style>
