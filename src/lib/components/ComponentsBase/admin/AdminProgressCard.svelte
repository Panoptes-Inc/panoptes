<script lang="ts">
  let {
    value,
    max,
    label = '先着登録ユーザー数'
  }: {
    value: number;
    max: number;
    label?: string;
  } = $props();

  const safeMax = $derived(Math.max(1, max));
  const progress = $derived(Math.min(100, Math.max(0, (value / safeMax) * 100)));
</script>

<article class="progress-card">
  <div class="ring" style={`--progress: ${progress * 3.6}deg`}>
    <span>{value}/{max}</span>
  </div>
  <div class="copy">
    <p>{label}</p>
    <strong>{value}/{max}</strong>
  </div>
</article>

<style>
  .progress-card {
    min-height: 244px;
    display: grid;
    grid-template-columns: minmax(160px, 0.9fr) minmax(180px, 1.1fr);
    gap: 24px;
    align-items: center;
    padding: 18px;
    color: #ff5f00;
  }

  .ring {
    width: min(210px, 100%);
    aspect-ratio: 1;
    margin: auto;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: conic-gradient(#ff5f00 var(--progress), #ffe0ce 0);
    position: relative;
  }

  .ring::after {
    content: '';
    position: absolute;
    inset: 20px;
    border-radius: 50%;
    background: #fff;
  }

  .ring span {
    position: relative;
    z-index: 1;
    color: #5f5f64;
    font-size: clamp(32px, 3vw, 50px);
  }

  .copy {
    display: grid;
    justify-items: center;
    gap: 8px;
    text-align: center;
  }

  .copy p,
  .copy strong {
    margin: 0;
  }

  .copy p {
    font-size: clamp(16px, 1.5vw, 22px);
    font-weight: 600;
  }

  .copy strong {
    font-size: clamp(34px, 4vw, 54px);
    font-weight: 400;
  }

  @media (max-width: 720px) {
    .progress-card {
      grid-template-columns: 1fr;
    }
  }
</style>
