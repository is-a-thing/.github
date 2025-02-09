<script>
	import DomainInput from '$lib/client/components/DomainInput.svelte'

	let { data } = $props()
	let name = data.name
</script>

<div class="flex flex-col h-full items-center justify-center md:items-start md:pl-32 pb-16">
	<h1 class="text-6xl">free is-a-th.ing subdomain</h1>
	<div class="flex flex-row gap-x-2">
		<DomainInput {name} />
	</div>
</div>
