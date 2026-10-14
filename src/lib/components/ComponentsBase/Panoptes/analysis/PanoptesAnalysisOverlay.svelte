<script lang="ts">
  import type { PanoptesAnalysisRuntimeStore, PanoptesInferenceDraft } from '$lib/panoptes/types';
  import PanoptesAnalysisSurface from './PanoptesAnalysisSurface.svelte';

  let {
    runtime,
    presentation,
    inferenceDraft,
    onIndustryInput,
    onStructureInput,
    onScaleInput,
    onConfirm
  }: {
    runtime: PanoptesAnalysisRuntimeStore | null;
    presentation: { title: string; subtitle: string; showConfirmButton: boolean };
    inferenceDraft: PanoptesInferenceDraft | null;
    onIndustryInput: (value: string) => void;
    onStructureInput: (value: string) => void;
    onScaleInput: (value: string) => void;
    onConfirm: () => void;
  } = $props();
</script>

<div class="overlay-shell">
  <PanoptesAnalysisSurface
    variant="overlay"
    {runtime}
    {presentation}
    {inferenceDraft}
    {onIndustryInput}
    {onStructureInput}
    {onScaleInput}
    {onConfirm}
  />
</div>

<style>
  .overlay-shell {
    position: sticky;
    bottom: 16px;
    z-index: 3;
  }
</style>
