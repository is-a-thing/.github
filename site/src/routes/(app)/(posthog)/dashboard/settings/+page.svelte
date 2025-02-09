<script lang="ts">
	import { logout } from '$lib/client/api/index.js'

	let { data } = $props()
</script>

<div class="mx-1 md:mx-2">
	<h1 class="text-4xl">settings</h1>
	<hr class="my-2" />

	<span class="text-accent">more here coming soon!</span><br />

	<button class="btn btn-error" onclick={logout}>logout</button>
</div>
