import { fetchAPI } from '$lib/client/api'

export async function load({ parent, fetch, params: { domain } }) {
	const { auth } = await parent()
	const availableR = await fetchAPI(`/domains/available/${domain}`, { fetch })
	const available: boolean = await availableR.json()
	return {
		auth,
		available,
		domain
	}
}
