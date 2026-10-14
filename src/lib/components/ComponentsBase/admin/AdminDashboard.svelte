<script lang="ts">
  import type { AdminSummary, AdminUserRow } from './data/admin-data';
  import AdminAddUserForm from './AdminAddUserForm.svelte';
  import AdminMetricCard from './AdminMetricCard.svelte';
  import AdminProgressCard from './AdminProgressCard.svelte';
  import AdminUserTable from './AdminUserTable.svelte';

  let {
    summary,
    users
  }: {
    summary: AdminSummary;
    users: AdminUserRow[];
  } = $props();

  const formattedRevenue = $derived(
    new Intl.NumberFormat('ja-JP').format(summary.miniPlanRevenue)
  );
</script>

<section class="admin-dashboard" aria-label="管理ダッシュボード">
  <div class="summary-column">
    <AdminProgressCard value={summary.priorityUsers} max={summary.capacity} />

    <div class="metric-grid">
      <AdminMetricCard label="本日の登録者数" value={summary.todayRegistrations} />
      <AdminMetricCard label="先行登録うち承認済みユーザー" value={summary.priorityAcceptedUsers} tone="orange" />
      <AdminMetricCard label="free" value={summary.freePlanUsers} />
      <AdminMetricCard label="Panoptes mini" value={`${summary.miniPlanUsers} / ${formattedRevenue}`} tone="orange" />
    </div>

    <AdminAddUserForm />
  </div>

  <AdminUserTable {users} />
</section>

<style>
  .admin-dashboard {
    min-height: 900px;
    display: grid;
    grid-template-columns: minmax(420px, 0.95fr) minmax(720px, 1.95fr);
    gap: 10px;
    padding: 8px;
    border: 1px solid #d7d7df;
    border-radius: 14px;
    background: #f4f4f7;
  }

  .summary-column {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: 12px;
    padding: 8px;
    border: 1px solid #dedee5;
    border-radius: 10px;
    background: #fff;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  @media (max-width: 1180px) {
    .admin-dashboard {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
