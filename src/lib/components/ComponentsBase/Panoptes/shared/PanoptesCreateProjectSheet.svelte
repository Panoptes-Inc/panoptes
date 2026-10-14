<script lang="ts">
  let {
    open = false,
    draftUrl = '',
    draftName = '',
    submitDisabled = false,
    onUrlInput = () => {},
    onNameInput = () => {},
    onClose = () => {},
    onSubmit = () => {}
  }: {
    open?: boolean;
    draftUrl?: string;
    draftName?: string;
    submitDisabled?: boolean;
    onUrlInput?: (value: string) => void;
    onNameInput?: (value: string) => void;
    onClose?: () => void;
    onSubmit?: () => void;
  } = $props();
</script>

{#if open}
  <button type="button" class="sheet-backdrop" onclick={onClose} aria-label="モーダルを閉じる"></button>
  <aside class="sheet" aria-label="新規分析作成">
    <header>
      <div>
        <p class="eyebrow">Create Project</p>
        <h2>URL から新規分析を開始</h2>
      </div>
      <button type="button" class="close" onclick={onClose}>×</button>
    </header>

    <label class="field">
      <span>表示名</span>
      <input
        type="text"
        value={draftName}
        placeholder="例: Panoptes Demo"
        oninput={(event) => onNameInput((event.currentTarget as HTMLInputElement).value)}
      />
    </label>

    <label class="field">
      <span>分析対象 URL</span>
      <input
        type="url"
        value={draftUrl}
        placeholder="https://example.com"
        oninput={(event) => onUrlInput((event.currentTarget as HTMLInputElement).value)}
      />
    </label>

    <div class="sheet-actions">
      <button type="button" class="secondary" onclick={onClose}>閉じる</button>
      <button type="button" class="primary" onclick={onSubmit} disabled={submitDisabled}>分析開始</button>
    </div>
  </aside>
{/if}

<style>
  .sheet-backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    border: 0;
    background: rgba(24, 18, 8, 0.18);
    backdrop-filter: blur(4px);
  }

  .sheet {
    position: fixed;
    right: 24px;
    top: 98px;
    z-index: 91;
    width: min(420px, calc(100vw - 32px));
    padding: 22px;
    border-radius: 28px;
    background: rgba(255, 248, 242, 0.98);
    box-shadow: 0 28px 60px rgba(47, 34, 10, 0.18);
    display: grid;
    gap: 18px;
  }

  header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: start;
  }

  .eyebrow {
    margin: 0 0 6px;
    color: #ff6200;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: #453d36;
    font-size: 24px;
    line-height: 1.2;
  }

  .close {
    border: 0;
    background: transparent;
    color: #6b625c;
    font-size: 24px;
    cursor: pointer;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field span {
    color: #6b625c;
    font-size: 13px;
  }

  .field input {
    width: 100%;
    box-sizing: border-box;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid #eadfd3;
    background: #fff;
    color: #453d36;
    font-size: 14px;
  }

  .sheet-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .sheet-actions button {
    border: 0;
    border-radius: 999px;
    min-width: 104px;
    min-height: 42px;
    padding: 0 18px;
    cursor: pointer;
  }

  .secondary {
    background: #efe8e0;
    color: #5e5348;
  }

  .primary {
    background: linear-gradient(135deg, #6c5eff, #4d41ff);
    color: #fff;
  }
</style>
