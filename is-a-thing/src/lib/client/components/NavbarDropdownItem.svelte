<script lang="ts">
	import type { Snippet } from 'svelte'

	const { href, icon, children }: { href: string; icon: Snippet; children: Snippet } = $props()
</script>

<li class="flex flex-row">
	<a {href} class="flex-grow flex flex-row">
		{@render icon?.()}
		<span class="flex-grow flex justify-end text-lg">{@render children()}</span>
	</a>
</li>
