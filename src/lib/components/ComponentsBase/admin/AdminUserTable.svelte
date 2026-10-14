<script lang="ts">
  import type { AdminUserRow } from './data/admin-data';

  let { users }: { users: AdminUserRow[] } = $props();
  let selectedUserIds = $state<string[]>([]);

  const allSelected = $derived(users.length > 0 && selectedUserIds.length === users.length);

  function toggleUser(userId: string): void {
    selectedUserIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
  }

  function toggleAll(): void {
    selectedUserIds = allSelected ? [] : users.map((user) => user.id);
  }
</script>

<section class="user-panel" aria-labelledby="admin-user-list-title">
  <header>
    <h2 id="admin-user-list-title">ユーザー一覧</h2>
    <span>{users.length}件</span>
  </header>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th scope="col">
            <input
              type="checkbox"
              aria-label="全ユーザーを選択"
              checked={allSelected}
              onchange={toggleAll}
            />
          </th>
          <th scope="col">順序</th>
          <th scope="col">メールアドレス</th>
          <th scope="col">プラン</th>
          <th scope="col">作成日時</th>
          <th scope="col">source</th>
          <th scope="col">URL</th>
          <th scope="col">ID</th>
          <th scope="col">承認</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user (user.id)}
          <tr>
            <td>
              <input
                type="checkbox"
                aria-label={`${user.email}を選択`}
                checked={selectedUserIds.includes(user.id)}
                onchange={() => toggleUser(user.id)}
              />
            </td>
            <td>{user.order}</td>
            <td>{user.email}</td>
            <td>{user.plan}</td>
            <td>{user.createdAt}</td>
            <td>{user.source}</td>
            <td><span class="url">{user.url}</span></td>
            <td>{user.id}</td>
            <td><strong>{user.status}</strong></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .user-panel {
    min-width: 0;
    min-height: 100%;
    padding: 12px;
    border: 1px solid #dedee5;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 2px 7px rgba(35, 29, 67, 0.07);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  h2 {
    margin: 0;
    color: #303039;
    font-size: 16px;
  }

  header span {
    color: #777782;
    font-size: 12px;
  }

  .table-scroll {
    overflow: auto;
  }

  table {
    width: 100%;
    min-width: 960px;
    border-collapse: collapse;
    color: #31313a;
    font-size: 12px;
  }

  th,
  td {
    padding: 9px 10px;
    border-bottom: 1px solid #e8e8ec;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: #494951;
    font-weight: 500;
  }

  input[type='checkbox'] {
    width: 17px;
    height: 17px;
  }

  .url {
    display: block;
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    color: #ff5f00;
    font-weight: 600;
  }
</style>
