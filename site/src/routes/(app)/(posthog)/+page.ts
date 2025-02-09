import { normalizeDomainName } from '$lib/shared/domain'

export function load({ url }) {
	return {
		name: normalizeDomainName(url.searchParams.get('sub'))
	}
}
