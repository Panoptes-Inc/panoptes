<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Organization選択 | Panoptes</title>
</svelte:head>

<main class="organization-page">
	<section class="organization-card">
		<h1>Organizationを選択</h1>
		<p>アクセスするOrganizationを選択してください。</p>

		{#if data.memberships.length > 0}
			<form method="POST" action={`?/default&returnTo=${encodeURIComponent(data.returnTo)}`}>
				{#each data.memberships as membership (membership.organizationId)}
					<button type="submit" name="organizationId" value={membership.organizationId}>
						<strong>{membership.organizationId}</strong>
						<span>{membership.role}</span>
					</button>
				{/each}
			</form>
		{:else}
			<p class="empty-state">
				利用可能なOrganization membershipがありません。管理者へ連絡してください。
			</p>
		{/if}
	</section>
</main>

<style>
	.organization-page {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 96px 20px 40px;
		background: #f5f5f8;
	}

	.organization-card {
		width: min(100%, 620px);
		padding: 28px;
		border: 1px solid #dedee8;
		border-radius: 18px;
		background: #fff;
		box-shadow: 0 12px 32px rgba(36, 36, 45, 0.08);
	}

	.organization-card h1,
	.organization-card p {
		margin-top: 0;
	}

	.organization-card form {
		display: grid;
		gap: 12px;
		margin-top: 24px;
	}

	.organization-card button {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 16px;
		border: 1px solid #d8d8e5;
		border-radius: 12px;
		background: #fafafe;
		cursor: pointer;
	}

	.organization-card button:hover {
		border-color: #7771e8;
		background: #f4f3ff;
	}

	.organization-card span,
	.empty-state {
		color: #686879;
	}
</style>
