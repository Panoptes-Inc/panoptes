<script lang="ts">
  let {
    heading = '分析中です',
    body = 'server-confirmed milestone を待機しながら進行します。'
  }: {
    heading?: string;
    body?: string;
  } = $props();
</script>

<div class="generic-step">
  <div class="generic-orbit"></div>
  <h3>{heading}</h3>
  <p>{body}</p>
</div>

<style>
  .generic-step {
    display: grid;
    justify-items: center;
    gap: 14px;
    text-align: center;
  }

  .generic-orbit {
    width: 96px;
    height: 96px;
    border-radius: 999px;
    background:
      radial-gradient(circle at center, rgba(255, 125, 36, 0.18) 0 24px, transparent 24px),
      conic-gradient(from 180deg, #ffc79a, #ff7d24, #ffc79a);
    -webkit-mask: radial-gradient(circle at center, transparent 0 36px, #000 36px);
    mask: radial-gradient(circle at center, transparent 0 36px, #000 36px);
    animation: rotate 1.1s linear infinite;
  }

  h3 {
    margin: 0;
    color: #4a3f36;
    font-size: 30px;
  }

  p {
    margin: 0;
    max-width: 560px;
    color: #7a6f66;
    font-size: 14px;
    line-height: 1.7;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
</style>
