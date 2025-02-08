<script>
	import { goto, invalidate } from '$app/navigation'
	import { fetchAPI } from '$lib/client/api'

	let { data } = $props()
	let { available, auth, domain } = data
	let { domains, slots } = auth
	invalidate('app:auth')

	async function get() {
		const res = await fetchAPI(`/domains/get/${domain}`, { init: { method: 'POST' } })
		await invalidate('app:auth')
		if (res.ok) {
			await goto('/dashboard/~')
		}
	}
</script>

<div class="flex flex-col h-full items-center justify-center md:items-start md:pl-32 pb-16">
	<!-- <h1 class="text-6xl">Free is-a-th.ing subdomain</h1>
	<div class="flex flex-row gap-x-2">
		<DomainInput {name} />
	</div> -->
	{#if available}
		{#if Object.entries(domains).length >= slots}
			<span class="text-warning text-2xl"
				>{domain} is available, but you do not have any more slots <br /> you will be able to get more
				slots soon.</span
			>
			<button class="btn btn-primary btn-xl">GET</button>
		{:else}
			<span class="text-success text-2xl">{domain} is available</span>
			<button class="btn btn-primary btn-xl" onclick={get}>GET</button>
		{/if}
	{:else}
		<span class="text-error text-2xl">{domain} is unavailable.</span>
	{/if}
</div>
