import { fetchAPI } from '$lib/client/api'

export async function load({ parent, fetch, params: { domain } }) {
	const { user, domains } = await parent()
    const availableR = await fetchAPI(`/domains/available/${domain}`, 'GET', {}, fetch)
    const available: boolean = await availableR.json()
	return {
		user,
        domains,
        domain,
        available,
	}
}
