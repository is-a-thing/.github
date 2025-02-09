function normalizeFirst(v: string | null) {
	return v
		?.toLowerCase()
		?.replace(/\s+/g, '-')
		?.replace(/[^a-z0-9-]/g, '')
}

export function normalizeDomainNameWhileTyping(v: string | null) {
	return normalizeFirst(v)
		?.replace(/--+/g, '-')
		?.substring(0, 64)
}

export function normalizeDomainName(v: string): string
export function normalizeDomainName(v: null): undefined
export function normalizeDomainName(v: string | null): string | undefined {
	return normalizeFirst(v)
		?.replace(/^-+|-+$/g, '')
		?.replace(/--+/g, '-')
		?.substring(0, 64)
}