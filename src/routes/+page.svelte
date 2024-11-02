<script lang="ts">
	import { normalizeDomainName } from '$lib/utils'
	import { delay } from '@std/async'
	class Domain {
		#state = $state('')
		get state() {
			return this.#state
		}
		set state(v: string) {
			this.#state = normalizeDomainName(v) || ''
		}
	}

	let focused = $state(false)
	class Placeholder {
		#state = $state('')
		#waiting = $derived(focused || !!domain.state)

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

<div class="flex flex-col items-center justify-center">
	<div class="flex flex-row text-3xl">
		<input
			bind:this={input}
			oninput={onUpdate}
			bind:value={domain.state}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			style="width: {clientWidth}px"
			class="placeholder:text-base-content/40 bg-base-100"
			type="text"
			placeholder={placeholder.state}
		/>
		<button onclick={() => input.focus()} class="text-base-content/45 cursor-text"
			>.is-a-th.ing</button
		>
	</div>
</div>
