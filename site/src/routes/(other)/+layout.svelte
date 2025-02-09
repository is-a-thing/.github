<script>
	let { children } = $props()
</script>

<div class="fixed top-0 backdrop-blur navbar bg-base-200/80 text-base-content z-1">
	<a data-sveltekit-reload href="/" class="btn btn-ghost text-4xl font-jersey15">is-a-th.ing</a>
</div>
<div class="h-16"></div>
{@render children()}
