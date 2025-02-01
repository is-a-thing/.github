import { normalizeDomainName } from '$lib/utils'

export function load({ url }) {
	return {
		name: normalizeDomainName(url.searchParams.get('sub'))
	}
}
