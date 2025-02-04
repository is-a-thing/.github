import { fetchAPI } from '$lib/client/api'
import type { domain } from '$lib/shared/schema.js'

export async function load({ parent, fetch }) {
	const { user } = await parent()
	const domainsR = await fetchAPI('/me/domains', { fetch })
	const domains: Zod.infer<typeof domain>[] = await domainsR.json()
	return {
		user,
		domains
	}
}
