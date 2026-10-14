<script lang="ts">
  let { statusMessage = '分析対象 URL を解析中です' }: { statusMessage?: string } = $props();
</script>

<div class="loading-step">
  <div class="loading-ring"></div>
  <p>{statusMessage}</p>
</div>

<style>
  .loading-step {
    display: grid;
    justify-items: center;
    gap: 18px;
  }

  .loading-ring {
    width: 84px;
    height: 84px;
    border-radius: 999px;
    border: 7px solid #ffe1cb;
    border-top-color: #ff7c24;
    animation: rotate 0.9s linear infinite;
  }

  p {
    margin: 0;
    color: #6d635b;
    font-size: 28px;
    text-align: center;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
</style>
