// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { Session, User } from '$lib/server/auth'

import { z } from 'zod'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User
			session: Session
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
