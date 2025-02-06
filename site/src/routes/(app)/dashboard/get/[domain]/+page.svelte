<script>
	import { goto, invalidate } from '$app/navigation'
	import { fetchAPI } from '$lib/client/api'

	const { data } = $props()
	const { available, auth, domain } = data
    const { domains, slots } = auth
	invalidate('app:auth')

	async function get() {
		const res = await fetchAPI(`/domains/get/${domain}`, { init: { method: "POST" } })
        if(res.ok) {
            goto('/dashboard/~')
        }
	}
</script>

<div class="flex flex-col h-full items-center justify-center md:items-start md:pl-32 pb-16">
	<!-- <h1 class="text-6xl">Free is-a-th.ing subdomain</h1>
	<div class="flex flex-row gap-x-2">
		<DomainInput {name} />
	</div> -->
	{#if available}
		{#if domains.length >= slots}
			<span class="text-warning text-2xl"
				>{domain} is available, but you do not have any more slots <br /> you may send a request to get
				this subdomain</span
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
