<script lang="ts">
	import DomainInput from '$lib/client/components/DomainInput.svelte'
	import DomainSettings from '$lib/client/components/DomainSettings.svelte'
	import { domain } from '$lib/shared/schema'

	let { data } = $props()
	let { auth } = data
	let domains = $derived(Object.values(auth.domains))

	let selectedSubdomainName = $state<string>()
	let selectedSubdomain = $derived(selectedSubdomainName ? auth.domains[selectedSubdomainName] : null)
	let drawerOpen = $derived(selectedSubdomainName != undefined)

	let tainted = $state<boolean>()
	$inspect('tainted', tainted)

	function close() {
		if(!tainted || confirm("Exit settings without saving?")) {
			selectedSubdomainName = undefined
			return;
		}
	}

	$inspect(selectedSubdomainName, selectedSubdomain)
</script>

<div class="drawer drawer-end">
	<input id="settings-drawer" type="checkbox" bind:checked={
		() => drawerOpen,
		(t) => {
			return t == true? null : close()
		}
		} defaultChecked={false} class="drawer-toggle" />
	<div class="drawer-content">
		<h1 class="text-4xl">domains</h1>
		<hr class="my-2" />

		<span class="text-md">ready for a new one?</span>
		<DomainInput full />

		<span class="text-md">my domains</span>
		<hr class="my-2" />

		{#snippet renderDomain(domainObj: Zod.infer<typeof domain>)}
			<button
				onclick={() => (selectedSubdomainName = domainObj.name)}
				class="list-row flex justify-between cursor-pointer"
				class:bg-base-300={selectedSubdomainName === domainObj.name}
			>
				<span>{domainObj.name}</span>
			</button>
		{/snippet}

		{#if domains.length}
			<ul class="list md:mx-5 bg-base-100 rounded-box border">
				{#each domains as domain}
					{@render renderDomain(domain)}
				{/each}
			</ul>
		{:else}
			<div class="text-center !w-full text-accent">no subdomains</div>
		{/if}
	</div>
	<div class="drawer-side pt-16">
		<button onclick={close} aria-label="close sidebar" class="drawer-overlay !cursor-default"></button>
		<div class="menu bg-base-200 text-base-content min-h-full w-lg p-4">
			{#if selectedSubdomainName}
				<DomainSettings domain={selectedSubdomain} bind:tainted />
			{/if}
		</div>
	</div>
</div>
