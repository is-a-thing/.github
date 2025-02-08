import { normalizeDomainName } from '$shared/domain.ts'
import { BANNED_DOMAINS } from '$util/env.ts'

const banned_domains = BANNED_DOMAINS.split(',')

export function checkDomainName(v: string): boolean {
	if (v.length < 3) return false
	if (v !== normalizeDomainName(v)) return false
	if (banned_domains.includes(v)) return false
	return true
}
