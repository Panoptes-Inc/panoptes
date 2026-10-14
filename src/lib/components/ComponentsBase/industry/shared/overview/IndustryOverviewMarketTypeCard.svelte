<script>
  let { marketType } = $props();
</script>

<section class="market-type-card" aria-label="市場タイプ">
  <div class="headline">
    <span class="label">市場タイプ：</span>
    <strong>{marketType?.typeLabel ?? '--'}</strong>
    <span class="confidence">確信度：{marketType?.confidence ?? '--'}%</span>
  </div>

  <p>{marketType?.description ?? ''}</p>
  <p>{marketType?.detail ?? ''}</p>
</section>

<style>
  .market-type-card {
    border-radius: 8px;
    background: #fff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
  }

  .headline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .label {
    color: var(--industry-text, #3f3832);
    font-size: 18px;
    font-weight: 400;
  }

  strong {
    color: var(--industry-orange, #ff6a00);
    font-size: 18px;
  }

  .confidence {
    color: var(--industry-text, #3f3832);
    font-size: 18px;
    font-weight: 400;
  }

  p {
    margin: 0;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
  }
</style>
