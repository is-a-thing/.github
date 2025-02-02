export async function checkNSRecord(subdomain: string) {
	const query = `${subdomain}.is-a-th.ing`
	if (globalThis?.Deno) {
		return await Deno.resolveDns(query, 'NS')
	} else {
		const { resolveNs } = await import('node:dns/promises')
		return await resolveNs(query)
	}
}
