<script lang="ts">
	import { normalizeDomainName } from '$lib/shared/domain'
	import { delay, debounce } from '@std/async'
	class Domain {
		#state = $state('')
		get state() {
			return this.#state
		}
		set state(v: string) {
			this.#state = normalizeDomainName(v) || ''
		}
	}

	class Placeholder {
		#state = $state('')
		#waiting = $derived(!!domain.state)

		get state() {
			return this.#state
		}

		constructor(private list: string[]) {
			this.cycle()
		}

		async cycle() {
			while (!this.#waiting) {
				for (const word of this.list) {
					for (let i = 0; i < word.length; i++) {
						this.#state = `${this.#state}${word[i]}`
						await delay(100)
						while (this.#waiting) {
							await delay(100)
						}
					}
					await delay(3000)
					while (this.#waiting) {
						await delay(100)
					}

					for (let i = word.length; i > -1; i--) {
						this.#state = this.#state.substring(0, i)
						await delay(100)
						while (this.#waiting) {
							await delay(100)
						}
					}
				}
			}
		}
	}

	const domain = new Domain()
	let input: HTMLInputElement
	let span: HTMLSpanElement

	function onUpdate() {
		clientWidth = span.offsetWidth
	}
	let clientWidth = $state(0)

	let { data } = $props()
	let { name } = data

	const placeholder = new Placeholder(
		(() => {
			const arr = ['your-idea', 'subdomain']
			if (name) arr.push(name)
			return arr
		})()
	)
</script>

<span
	bind:offsetWidth={clientWidth}
	bind:this={span}
	class="text-3xl invisible absolute whitespace-pre pointer-events-none"
	>{domain.state || placeholder.state}</span
>

<div class="flex flex-col h-full items-center justify-center md:items-start md:pl-32 pb-16">
	<h1 class="text-6xl">Free is-a-th.ing subdomain</h1>
	<div class="flex flex-row gap-x-2">
		<label class="flex flex-row text-3xl input input-bordered min-w-96">
			<input
				bind:this={input}
				oninput={onUpdate}
				bind:value={domain.state}
				style="width: {clientWidth}px"
				class="placeholder:text-base-content/40 bg-base-100"
				type="text"
				placeholder={placeholder.state}
			/>
			<button onclick={() => input.focus()} class="text-base-content/45 cursor-text"
				>.is-a-th.ing</button
			>
		</label>
		<button class="btn btn-primary text-2xl">Fetch</button>
	</div>
</div>
