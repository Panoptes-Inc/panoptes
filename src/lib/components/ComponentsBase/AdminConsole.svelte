<script lang="ts">
	import AdminDashboard from '$lib/components/ComponentsBase/admin/AdminDashboard.svelte';
	import AdminTabs from '$lib/components/ComponentsBase/admin/AdminTabs.svelte';
	import {
		adminLogs,
		adminServiceStatuses,
		adminSummary,
		adminUsers
	} from '$lib/components/ComponentsBase/admin/data/admin-data';
	import type { AdminTab } from '$lib/components/ComponentsBase/admin/data/admin-data';

	let activeTab = $state<AdminTab>('dashboard');
</script>

<div class="admin-shell">
	<AdminTabs activeTab={activeTab} onTabChange={(tab) => (activeTab = tab)} />

	<div class="content-card">
		{#if activeTab === 'dashboard'}
			<AdminDashboard summary={adminSummary} users={adminUsers} />
		{:else}
			<section class="log-panel" aria-label="ログと運用状況">
				<h2>ログ・運用状況</h2>
				<p>dummy seed の feed placeholder をベースに、開発用の運用ログとサービス状態を表示しています。</p>
				<div class="placeholder-grid">
					<article>
						<h3>運用アラート</h3>
						<ul>
							{#each adminLogs as log}
								<li>{log.timestamp} {log.label}</li>
							{/each}
						</ul>
					</article>
					<article>
						<h3>運用サービス</h3>
						<ul>
							{#each adminServiceStatuses as service}
								<li>{service.label}: {service.state}</li>
							{/each}
						</ul>
					</article>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.admin-shell {
		width: min(2000px, 100%);
		padding: 10px;
		display: grid;
		gap: 10px;
	}

	.content-card {
		border: 1px solid #d2d2dc;
		border-radius: 18px;
		background: #efeff2;
		box-shadow:
			0 20px 40px rgba(26, 17, 58, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.66);
		padding: 8px;
	}

	.log-panel {
		min-height: 920px;
		border: 1px solid #d7d7df;
		border-radius: 14px;
		background: #f4f4f7;
		padding: 18px;
		display: grid;
		align-content: start;
		gap: 16px;
	}

	.log-panel h2 {
		margin: 0;
		font-size: clamp(28px, 2vw, 40px);
		color: #2e2f35;
	}

	.log-panel p {
		margin: 0;
		font-size: clamp(14px, 1.1vw, 18px);
		color: #595a63;
	}

	.placeholder-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}

	.placeholder-grid article {
		padding: 14px;
		border: 1px solid #d6d6de;
		border-radius: 12px;
		background: #fafaff;
	}

	.placeholder-grid h3 {
		margin: 0 0 8px;
		font-size: clamp(18px, 1.4vw, 26px);
		color: #32333b;
	}

	.placeholder-grid ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
		color: #454754;
		font-size: clamp(14px, 1vw, 16px);
	}

	@media (max-width: 900px) {
		.admin-shell {
			padding: 8px;
		}

		.placeholder-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
