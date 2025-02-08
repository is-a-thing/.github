<script lang="ts">
	import type { Snippet } from 'svelte'

	let { href, icon, children }: { href: string; icon: Snippet; children: Snippet } = $props()
</script>

<li class="flex flex-row">
	<a {href} class="grow flex flex-row">
		{@render icon?.()}
		<span class="grow flex justify-end text-lg">{@render children()}</span>
	</a>
</li>
