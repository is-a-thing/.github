export function normalizeDomainName(v: string | null) {
	return v
		?.toLowerCase()
		?.replace(/\s+/g, '-')
		?.replace(/[^a-z0-9-]/g, '')
		?.replace(/^-+|-+$/g, '')
		?.replace(/--+/g, '-')
		?.substring(0, 64)
}
