<script lang="ts">
  let {
    title,
    body
  }: {
    title: string;
    body: string;
  } = $props();
</script>

<section class="summary-card">
  <h3>{title}</h3>
  <p>{body}</p>
</section>

<style>
  .summary-card {
    padding: 8px;
    border-radius: 8px;
    background: #fff;
    display: flex;
    flex-flow: column;
    gap: 8px;
    box-shadow: 0 0 4px #00000016;
    width: 100%;
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: #453b34;
    font-size: 22px;
  }

  p {
    color: #7b7067;
    line-height: 1.7;
  }
</style>
