<script lang="ts">
  import type { PanoptesAnalysisRuntimeStore, PanoptesInferenceDraft } from '$lib/panoptes/types';
  import PanoptesAnalysisPanelFrame from './frame/PanoptesAnalysisPanelFrame.svelte';
  import PanoptesAnalysisEmptyState from './steps/PanoptesAnalysisEmptyState.svelte';
  import PanoptesAnalysisFailureState from './steps/PanoptesAnalysisFailureState.svelte';
  import PanoptesAnalysisInferenceReviewStep from './steps/PanoptesAnalysisInferenceReviewStep.svelte';
  import PanoptesAnalysisLoadingStep from './steps/PanoptesAnalysisLoadingStep.svelte';
  import PanoptesAnalysisTargetScanStep from './steps/PanoptesAnalysisTargetScanStep.svelte';

  let {
    variant = 'flow',
    runtime = null,
    presentation = { title: '分析を準備中です', subtitle: '', showConfirmButton: false },
    inferenceDraft = null,
    onIndustryInput = () => {},
    onStructureInput = () => {},
    onScaleInput = () => {},
    onConfirm = () => {},
    onCreate = () => {},
    onRetry = () => {}
  }: {
    variant?: 'flow' | 'overlay' | 'empty' | 'failed';
    runtime?: PanoptesAnalysisRuntimeStore | null;
    presentation?: { title: string; subtitle: string; showConfirmButton: boolean };
    inferenceDraft?: PanoptesInferenceDraft | null;
    onIndustryInput?: (value: string) => void;
    onStructureInput?: (value: string) => void;
    onScaleInput?: (value: string) => void;
    onConfirm?: () => void;
    onCreate?: () => void;
    onRetry?: () => void;
  } = $props();
</script>

{#if variant === 'empty'}
  <PanoptesAnalysisEmptyState {onCreate} />
{:else if variant === 'failed'}
  <PanoptesAnalysisFailureState message={runtime?.statusMessage ?? '分析に失敗しました。'} {onRetry} />
{:else}
  <PanoptesAnalysisPanelFrame
    mode={variant === 'overlay' ? 'overlay' : 'full'}
    title={presentation.title}
    subtitle={presentation.subtitle}
    activeStep={runtime?.visibleStep ?? 'target_scan'}
  >
    {#if runtime?.visibleStep === 'target_scan'}
      <PanoptesAnalysisTargetScanStep statusMessage={runtime?.statusMessage ?? presentation.title} />
    {:else if runtime?.visibleStep === 'inference_review'}
      <PanoptesAnalysisInferenceReviewStep
        {inferenceDraft}
        submitDisabled={runtime?.confirmMutationStatus === 'submitting'}
        {onIndustryInput}
        {onStructureInput}
        {onScaleInput}
        {onConfirm}
      />
    {:else}
      <PanoptesAnalysisLoadingStep heading={presentation.title} body={presentation.subtitle} />
    {/if}
  </PanoptesAnalysisPanelFrame>
{/if}
