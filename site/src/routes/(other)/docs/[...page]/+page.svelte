<script lang="ts">
	import '$lib/client/docs'
	import { TOC, match } from '$lib/client/docs'

	let { data } = $props()

	let page = $derived(data.page.length?`/${data.page}`:'')
	let Component = $derived.by(() => {
		const result = match(page)
		return result
	})
	$inspect(Component, page, data)
</script>

<div class="h-full w-full flex flex-row">
	<div class="fixed h-full flex flex-col bg-base-200 overflow-y-scroll">
		<div class="min-w-60 flex flex-col items-start pl-2 pt-4">
			{#each Object.entries(TOC) as [name, value]}
				{#if typeof value === 'string'}
					<a href="/docs{value}">{name}</a>
				{:else if typeof value === 'object'}
					{#if value['_']}
						<a href="/docs{value['_']}" class="text-2xl font-bold">{name}</a>
					{:else}
						<h1 class="text-2xl font-bold">{name}</h1>
					{/if}
					<ul class="ml-2">
						{#each Object.entries(value) as [name, href]}
						{#if name !== '_'}
							<li>
								<a href="/docs{href}">{name}</a>
							</li>
						{/if}
					{/each}
					</ul>
				{/if}
			{/each}
		</div>
	</div>
	<div class="min-w-60"></div>
	{#key Component}
		<div class="font-jersey15 pt-2 pl-2 overflow-y-scroll !overflow-x-clip !max-w-full">
			<span class="prose">
				{#if Component}
					<Component />
				{/if}
			</span>
		</div>
		<div class="min-w-60 h-full flex flex-col bg-base-100 overflow-y-scroll">
			<div class="flex flex-col items-center pt-4"></div>
		</div>
	{/key}
</div>
