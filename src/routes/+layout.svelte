<script lang="ts">
	import '../app.pcss'
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props()
</script>

<div class="navbar bg-base-200 text-base-content">
	<a href="/" class="btn btn-ghost text-4xl font-jersey15">is-a-th.ing</a>
</div>
{@render children?.()}
