<script lang="ts">
  import type { PanoptesPhaseTaskStatus, PanoptesStrategyPhase } from '$lib/panoptes/types';
  import type { StrategyAnalysisRoadmapModel } from '../data/strategy-analysis-view-model';
  import StrategyAnalysisRoadmapPhaseCard from './StrategyAnalysisRoadmapPhaseCard.svelte';

  let {
    roadmap,
    taskMutationStatus = 'idle',
    onSelectPhase = () => {},
    onSelectTask = () => {},
    onUpdateTaskStatus = () => {}
  }: {
    roadmap: StrategyAnalysisRoadmapModel;
    taskMutationStatus?: 'idle' | 'saving' | 'failed';
    onSelectPhase?: (phase: PanoptesStrategyPhase) => void;
    onSelectTask?: (taskId: string | null) => void;
    onUpdateTaskStatus?: (taskId: string, status: PanoptesPhaseTaskStatus) => void;
  } = $props();
</script>

<section class="strategy-roadmap-section">
  <header class="roadmap-header">
    <div class="roadmap-title">
      <h2>現在のプロジェクト進行日数</h2>
    </div>
    <div class="progress-wrap">
      <strong>•{roadmap.projectDayCount}日</strong>
      <div class="progress-track" aria-label={`プロジェクト進行率 ${roadmap.projectDayPercent}%`}>
        <div class="progress-fill" style:width={`${roadmap.projectDayPercent}%`}></div>
      </div>
    </div>
  </header>

  <div class="phase-grid">
    {#each roadmap.phases as phaseCard (phaseCard.phase)}
      <div class="phase-slot">
        <StrategyAnalysisRoadmapPhaseCard
          {phaseCard}
          selectedPhase={roadmap.selectedPhase}
          {taskMutationStatus}
          onSelectPhase={onSelectPhase}
          onSelectTask={onSelectTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
        />
      </div>
    {/each}
  </div>
</section>

<style>
  .strategy-roadmap-section {
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 244, 0.98));
    box-shadow: 0 0 4px #00000016;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .progress-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .progress-wrap strong {
    word-break: keep-all;
  }

  .roadmap-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .roadmap-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .roadmap-header h2,
  .roadmap-header strong {
    margin: 0;
  }

  .roadmap-header h2 {
    color: #483a32;
    font-size: 18px;
  }

  .roadmap-header strong {
    color: #ff6d1d;
    font-size: 20px;
    line-height: 1;
  }

  .progress-track {
    width: 100%;
    height: 12px;
    border-radius: 999px;
    background: #ffe4d2;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #ffb27c, #ff6d1d);
  }

  .phase-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .phase-slot {
    flex: 1 1 320px;
    min-width: 0;
  }
</style>
