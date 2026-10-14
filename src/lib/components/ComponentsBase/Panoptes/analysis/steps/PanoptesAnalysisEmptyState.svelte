<script lang="ts">
  let { onCreate = () => {} }: { onCreate?: () => void } = $props();
</script>

<div class="state-card">
  <h3>URL を入力して分析を開始</h3>
  <p>
    project は維持したまま、`current_snapshot_id` が無い状態でも安全に扱えます。
    まずは URL を登録して create-and-start-analysis を実行します。
  </p>
  <button type="button" onclick={onCreate}>新規分析を追加</button>
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
    text-align: center;
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: #493f37;
    font-size: 28px;
  }

  p {
    max-width: 560px;
    color: #7c7067;
    line-height: 1.7;
  }

  button {
    border: 0;
    border-radius: 999px;
    min-width: 148px;
    min-height: 46px;
    background: linear-gradient(135deg, #6d5eff, #4d41ff);
    color: #fff;
    cursor: pointer;
  }
</style>
