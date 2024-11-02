<script lang=ts>
	// svelte-ignore perf_avoid_inline_class
	const domain = new (class {
		#state = $state('')
		get state() {
			return this.#state
		}
		set state(v: string) {
			this.#state = v.toLowerCase().replace(' ', '-').replace(/[^a-z0-9-]/g, '').replace(/-(-)*/g, '-')
		}
	})();
	let input: HTMLInputElement
	let span: HTMLSpanElement

	function onUpdate() {
		clientWidth = span.offsetWidth
	}
	let clientWidth = $state(0);

	// svelte-ignore perf_avoid_inline_class
	const placeholder = new (class {
		#state = $state('')

		get state() {
			return this.#state
		}

		constructor(list: string[]) {

		}
	})(['your-idea', 'subdomain'])
</script>

<span bind:offsetWidth={clientWidth} bind:this={span} class="text-3xl invisible absolute whitespace-pre pointer-events-none">{domain.state || 'your-idea'}</span>

<div class="flex flex-col items-center justify-center">
	
	<div class="flex flex-row text-3xl">
		<input bind:this={input} oninput={onUpdate} bind:value={domain.state} style="width: {clientWidth}px" class="placeholder:text-base-content/40 bg-base-100" type=text placeholder="your-idea" />
		<button onclick={() => input.focus()} class="text-base-content/45 cursor-text">.is-a-th.ing</button>
	</div>
</div>