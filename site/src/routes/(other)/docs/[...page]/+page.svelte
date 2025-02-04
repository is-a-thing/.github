<script lang="ts">
	import '$lib/client/docs'
	import { match } from '$lib/client/docs'

	const { data } = $props()
	let { page: _page } = data
	const page = $derived(`/${_page}`)
	let Component = match(page)
</script>

<div class="h-full w-full flex flex-row">
	<div class="h-full flex flex-col bg-base-200 overflow-y-scroll">
		<div class="w-60 flex flex-col items-center pt-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
			</svg>
		</div>
	</div>
	{#key Component}
		<div class="font-jersey15 pt-2 pl-2 grow overflow-y-scroll">
			<span class="prose">
				{#if Component}
					<Component></Component>
				{/if}
			</span>
		</div>
		<div class="h-full flex flex-col bg-base-200 overflow-y-scroll">
			<div class="w-60 flex flex-col items-center pt-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
				</svg>
			</div>
		</div>
	{/key}
</div>
