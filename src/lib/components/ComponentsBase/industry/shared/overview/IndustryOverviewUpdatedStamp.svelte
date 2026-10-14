<script>
  let { analyzedAt = '--' } = $props();
</script>

<p class="updated-stamp">最終分析日時：{analyzedAt}</p>

<style>
  .updated-stamp {
    margin: 0;
    text-align: right;
    color: var(--industry-muted, #7b7269);
    font-size: 12px;
    font-weight: 600;
  }

  @media (max-width: 1360px) {
    .updated-stamp {
      text-align: left;
    }
  }
</style>
