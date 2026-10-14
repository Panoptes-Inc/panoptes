<script lang="ts">
  let {
    label,
    value,
    tone = 'neutral'
  }: {
    label: string;
    value: string | number;
    tone?: 'neutral' | 'orange' | 'violet';
  } = $props();
</script>

<article class="metric-card" class:orange={tone === 'orange'} class:violet={tone === 'violet'}>
  <p>{label}</p>
  <strong>{value}</strong>
</article>

<style>
  .metric-card {
    min-height: 102px;
    padding: 12px;
    display: grid;
    align-content: space-between;
    border: 1px solid #e0e0e5;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 2px 7px rgba(35, 29, 67, 0.07);
    color: #606068;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  strong {
    justify-self: center;
    font-size: clamp(30px, 3vw, 52px);
    font-weight: 400;
    line-height: 1;
  }

  .orange {
    color: #ff5f00;
  }

  .violet {
    color: #594cff;
  }
</style>
