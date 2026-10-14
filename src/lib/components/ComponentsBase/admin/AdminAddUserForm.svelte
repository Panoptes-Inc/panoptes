<script lang="ts">
  let email = $state('');
  let password = $state('');
</script>

<section class="add-user" aria-labelledby="admin-add-user-title">
  <h2 id="admin-add-user-title">ユーザーを追加</h2>

  <label>
    <span>メールアドレス</span>
    <input type="email" bind:value={email} autocomplete="email" />
  </label>
  <label>
    <span>パスワード</span>
    <input type="password" bind:value={password} autocomplete="new-password" />
  </label>

  <div class="actions">
    <button type="button" class="priority">先行登録に追加</button>
    <button type="button" class="regular">通常登録に追加</button>
  </div>
</section>

<style>
  .add-user {
    display: grid;
    gap: 16px;
    padding: 22px 12px;
    border: 1px solid #e0e0e5;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 2px 7px rgba(35, 29, 67, 0.07);
  }

  h2 {
    margin: 0;
    text-align: center;
    color: #33343b;
    font-size: 18px;
    font-weight: 500;
  }

  label {
    width: min(420px, 100%);
    margin: 0 auto;
  }

  label span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  input {
    width: 100%;
    min-height: 46px;
    padding: 10px 18px;
    border: 1px solid #c8c4df;
    border-radius: 999px;
    background: #fff;
  }

  input:focus-visible {
    outline: 3px solid rgba(86, 74, 255, 0.16);
    border-color: #6659ff;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 8px;
  }

  button {
    min-height: 44px;
    border: 1px solid #786cff;
    border-radius: 999px;
    color: #fff;
    font-weight: 600;
  }

  .priority {
    background: linear-gradient(90deg, #ff833f, #ff5f00);
  }

  .regular {
    background: linear-gradient(90deg, #6659ff, #5144ff);
  }

  @media (max-width: 640px) {
    .actions {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }
</style>
