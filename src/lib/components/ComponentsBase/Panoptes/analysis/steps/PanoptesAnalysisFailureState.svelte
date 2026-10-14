<script lang="ts">
  let {
    message = '分析に失敗しました。',
    onRetry = () => {}
  }: {
    message?: string;
    onRetry?: () => void;
  } = $props();
</script>

<div class="state-card">
  <h3>分析の途中で問題が発生しました</h3>
  <p>{message}</p>
  <button type="button" onclick={onRetry}>再分析する</button>
</div>

<style>
  .state-card {
    min-height: 420px;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 16px;
    border-radius: 34px;
    background: linear-gradient(180deg, #fffaf5, #fff1e7);
    border: 1px solid #f0ddd0;
  }

  h3,
  p {
    margin: 0;
    text-align: center;
  }

  h3 {
    color: #493f37;
    font-size: 28px;
  }

  p {
    max-width: 520px;
    color: #7c7067;
    line-height: 1.7;
  }

  button {
    border: 0;
    border-radius: 999px;
    min-width: 148px;
    min-height: 46px;
    background: linear-gradient(135deg, #ff9b54, #ff6200);
    color: #fff;
    cursor: pointer;
  }
</style>
