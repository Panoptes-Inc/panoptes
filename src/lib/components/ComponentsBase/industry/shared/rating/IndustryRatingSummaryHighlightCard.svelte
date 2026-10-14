<script>
  let { highlight } = $props();
</script>

<article class="highlight-card">
  <p class="title">{highlight?.title ?? '--'}</p>
  <p class="accent">{highlight?.accent ?? '--'}</p>
  <p class="body">{highlight?.body ?? ''}</p>
</article>

<style>
  .highlight-card {
    border-radius: 8px;
    background: #ffffff;
    box-shadow: var(--industry-panel-shadow);
    padding: 8px;
    flex: 1 0 auto;
  }

  .title,
  .accent,
  .body {
    margin: 0;
  }

  .title {
    color: var(--industry-text, #3f3832);
    font-size: 13px;
    font-weight: 700;
  }

  .accent {
    margin-top: 6px;
    color: var(--industry-orange, #ff6a00);
    font-size: 14px;
    font-weight: 800;
  }

  .body {
    margin-top: 6px;
    color: var(--industry-muted, #7b7269);
    font-size: 13px;
    line-height: 1.6;
  }
</style>
