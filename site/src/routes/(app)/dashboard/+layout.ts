import { fetchAPI, publicApi } from '$lib/client/api'
import { redirect } from '@sveltejs/kit'
import { domain } from "$lib/shared/schema"

export async function load({ parent, url, fetch }) {
	const { user } = await parent()
	if (!user) redirect(303, `${publicApi}/auth?next=${url.pathname}`)
	const domainsR = await fetchAPI('/me/domains', 'GET', {}, fetch)
	const domains: Zod.infer<typeof domain>[] = await domainsR.json()
	return {
		user,
		domains,
	}
}
