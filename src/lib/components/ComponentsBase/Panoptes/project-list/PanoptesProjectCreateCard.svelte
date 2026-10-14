<script lang="ts">
  let { onCreate = () => {} }: { onCreate?: () => void } = $props();
</script>

<button type="button" class="create-card" onclick={onCreate}>
  <span>+</span>
  <strong>新しい分析を追加</strong>
</button>

<style>
  .create-card {
    width: 100%;
    min-height: 94px;
    border-radius: 18px;
    border: 1px dashed #e6cfbc;
    background: linear-gradient(180deg, #fff4ea, #ffe8d5);
    display: grid;
    place-items: center;
    gap: 6px;
    cursor: pointer;
    color: #d17a34;
  }

  .create-card span {
    font-size: 40px;
    line-height: 1;
  }

  .create-card strong {
    font-size: 13px;
  }
</style>
