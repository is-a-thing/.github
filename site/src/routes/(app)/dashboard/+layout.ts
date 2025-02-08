import { publicApi } from '$lib/client/api'

import { redirect } from '@sveltejs/kit'

export async function load({ parent, url }) {
	const { auth } = await parent()
	if (!auth) redirect(303, `${publicApi}/auth?next=${url.pathname}`)
	console.log(auth)
	return {
		auth
	}
}
