<script lang="ts">
	import DomainInput from '$lib/client/components/DomainInput.svelte'
	import { domain } from '$lib/shared/schema'

	const { data } = $props()
	const { auth } = data
</script>

<h1 class="text-4xl">Domains</h1>
<hr class="my-2" />

<span class="text-md">Ready for a new one?</span>
<DomainInput full />

<span class="text-md">My Domains</span>
<hr class="my-2" />

{#snippet renderDomain(domainObj: Zod.infer<typeof domain>)}
	<li class="list-row">
		<div>
			<span>{domainObj.name}</span>
		</div>
	</li>
{/snippet}

<ul class="list mx-5 bg-base-100 rounded-box border">
	{#each auth.domains as domain}
		{@render renderDomain(domain)}
	{/each}
</ul>
