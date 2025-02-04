import { fetchAPI } from '$lib/client/api'

export async function load({ parent, fetch }) {
	const { user } = await parent()
	const domainsR = await fetchAPI('/me/domains', 'GET', {}, fetch)
	const domains = await domainsR.json()
	return {
		user,
		domains
	}
}
