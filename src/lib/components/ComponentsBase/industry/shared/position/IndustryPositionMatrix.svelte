<section class="matrix-card" aria-label="市場ポジションマトリクス">
  <div class="matrix-grid">
    <div class="cell">構造優位</div>
    <div class="cell">先行帯</div>
    <div class="cell">平均帯</div>
    <div class="cell is-focus">
      <span class="focus-dot" aria-hidden="true"></span>
      <strong>挑戦帯</strong>
    </div>
  </div>
</section>

<style>
  .matrix-card {
    min-height: 240px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.7);
    flex: 1 1 auto;
  }

  .matrix-grid {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(120px, 1fr));
  }

  .cell {
    display: grid;
    place-items: center;
    color: #999088;
    font-size: 20px;
    font-weight: 500;
    border-right: 1px dashed rgba(255, 255, 255, 0.9);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.9);
    background: rgba(235, 232, 227, 0.72);
  }

  .cell:nth-child(2n) {
    border-right: 0;
  }

  .cell:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  .cell.is-focus {
    background: linear-gradient(180deg, rgba(255, 182, 127, 0.9), rgba(245, 148, 84, 0.95));
    color: #fff;
    position: relative;
    gap: 8px;
  }

  .focus-dot {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: linear-gradient(to right, #BBB7FF, #8E86FF);
    box-shadow: 0 0 0 5px rgb(11, 48, 255);
    position: absolute;
    top: 15%;
  }

  .cell.is-focus strong {
    font-size: 20px;
    position: relative;
  }
</style>
