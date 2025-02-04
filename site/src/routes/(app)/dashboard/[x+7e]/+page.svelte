<script lang="ts">
	import DomainInput from '$lib/client/components/DomainInput.svelte'

	const { data } = $props()
</script>

<h1 class="text-4xl">Domains</h1>
<hr class="my-2" />

<span class="text-md">Ready for a new one?</span>
<DomainInput full />

<ul>
	{#each data.domains as domain}
	{/each}
</ul>