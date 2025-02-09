<script>
	import { goto, invalidate } from '$app/navigation'
	import { fetchAPI } from '$lib/client/api'

	let { data } = $props()
	invalidate('app:auth')

	async function get() {
		const res = await fetchAPI(`/domains/get/${data.domain}`, { init: { method: 'POST' } })
		await invalidate('app:auth')
		if (res.ok) {
			await goto('/dashboard/~')
		}
	}
</script>

<div class="flex flex-col h-full items-center justify-center md:items-start md:pl-32 pb-16">
	{#if data.available}
		{#if Object.entries(data.auth.domains).length >= data.auth.slots}
			<span class="text-warning text-2xl"
				>{data.domain} is available, but you do not have any more slots <br /> you will be able to get
				more slots soon.</span
			>
			<button class="btn btn-primary btn-xl">GET</button>
		{:else}
			<span class="text-success text-2xl">{data.domain} is available</span>
			<button class="btn btn-primary btn-xl" onclick={get}>GET</button>
		{/if}
	{:else}
		<span class="text-error text-2xl">{data.domain} is unavailable.</span>
	{/if}
</div>
