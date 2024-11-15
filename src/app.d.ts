// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { AuthPair } from '$lib/server/auth'

declare global {
	declare module '*.md' {
		import type { Component } from 'svelte'

		const Comp: Component
		export default Comp

		export const metadata: Record<string, unknown>
	}
	namespace App {
		// interface Error {}
		interface Locals {
			auth:
				| AuthPair
				| {
						user: null
						session: null
				  }
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
