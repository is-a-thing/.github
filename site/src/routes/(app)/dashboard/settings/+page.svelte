<script lang="ts">
	import { logout } from '$lib/client/api/index.js'

	const { data } = $props()
</script>

<h1 class="text-4xl">Settings</h1>
<hr class="my-2" />

<span class="text-neutral-content">More here coming soon!</span>

<button class="btn btn-error" onclick={logout}>logout</button>
