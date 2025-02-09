<script lang="ts">
	import { fetchAPI } from '$lib/client/api/index.js'
	import { normalizeDomainName, normalizeDomainNameWhileTyping } from '$lib/shared/domain'

	import { debounce, delay } from '@std/async'

	let { name, full = false }: { name?: string; full?: boolean } = $props()

	class Domain {
		#state = $state('')
		get state() {
			return this.#state
		}
		set state(v: string) {
			this.#state = normalizeDomainNameWhileTyping(v) || ''
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
	let available = $state<boolean>()
	$effect(() => {
		if (domain.state) {
			available = undefined
			checkAvailable()
		} else {
			available = undefined
		}
	})

	const placeholder = new Placeholder(
		(() => {
			const arr = ['your-idea', 'subdomain']
			if (name) arr.push(name)
			return arr
		})()
	)

	const checkAvailable = debounce(async () => {
		if (domain.state) {
			if (normalizeDomainName(domain.state) !== domain.state) {
				domain.state = normalizeDomainName(domain.state)
				return checkAvailable.flush()
			}
			const response = await fetchAPI(`/domains/available/${domain.state}`)
			available = await response.json()
		}
	}, 1000)
</script>

<span
	bind:offsetWidth={clientWidth}
	bind:this={span}
	class="text-3xl invisible absolute whitespace-pre pointer-events-none"
	>{domain.state || placeholder.state}</span
>

<div class={full ? 'w-full flex flex-row' : 'contents'}>
	<label
		class="relative flex flex-row text-3xl input-ghost input gap-x-0 input-bordered !min-w-fit {full
			? 'w-full'
			: 'w-96'} overflow-visible"
	>
		<input
			bind:this={input}
			oninput={onUpdate}
			bind:value={domain.state}
			style="width: {clientWidth}px !important;"
			class="placeholder:text-base-content/40"
			class:text-error={available === false}
			type="text"
			placeholder={placeholder.state}
		/>
		<button onclick={() => input.focus()} class="text-base-content/45 cursor-text"
			>.is-a-th.ing</button
		>
		<div class="absolute flex items-center justify-center right-2">
			<span
				class="status transition-colors"
				class:status-success={available === true}
				class:status-error={available === false}
			></span>
		</div>
	</label>
	<a
		href="/dashboard/get/{domain.state}"
		class="btn btn-primary text-2xl uppercase"
		class:btn-disabled={available !== true}>fetch</a
	>
</div>
