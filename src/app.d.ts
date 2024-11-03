// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { AuthPair } from '$lib/server/auth'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthPair | {
				user: null,
				session: null
			}
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { }
