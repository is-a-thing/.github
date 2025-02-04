import { fetchAPI, publicApi } from '$lib/client/api'
import { domain } from '$lib/shared/schema'

import { redirect } from '@sveltejs/kit'

export async function load({ parent, url, fetch }) {
	const { user } = await parent()
	if (!user) redirect(303, `${publicApi}/auth?next=${url.pathname}`)
	const domainsR = await fetchAPI('/me/domains', {
		fetch
	})
	const domains: Zod.infer<typeof domain>[] = await domainsR.json()
	const slotsR = await fetchAPI('/me/slots', { fetch })
	const slots: number = await slotsR.json()
	return {
		user,
		domains,
		slots
	}
}
