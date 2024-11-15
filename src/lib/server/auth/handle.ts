import type { Handle } from '@sveltejs/kit'

import { createSessionCookie, deleteSessionCookie, validateSessionToken } from './'

export async function authHandle({ event, resolve }: Parameters<Handle>[0]): Promise<Response> {
	const token = event.cookies.get('session') ?? null

	if (token === null) {
		event.locals.auth = { session: null, user: null }
		return resolve(event)
	}

	const pairOption = await validateSessionToken(token)

	if (pairOption.isSome()) {
		const pair = pairOption.unwrap()
		createSessionCookie(token, event.cookies)
		event.locals.auth = pair
	} else {
		deleteSessionCookie(event.cookies)
		event.locals.auth = { session: null, user: null }
	}
	return resolve(event)
}
