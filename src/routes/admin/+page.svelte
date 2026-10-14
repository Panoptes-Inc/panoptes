<script>
	import AdminConsole from '$lib/components/ComponentsBase/AdminConsole.svelte';
</script>

<main class="admin-page">
	<AdminConsole />
</main>

<style>
	.admin-page {
		min-height: 100dvh;
		padding: 8px;
		background:
			radial-gradient(circle at top, rgba(129, 123, 255, 0.06) 0%, transparent 44%),
			linear-gradient(180deg, #f1f1f5 0%, #ececf1 100%);
	}

	@media (max-width: 900px) {
		.admin-page {
			padding: 4px;
		}
	}
</style>
