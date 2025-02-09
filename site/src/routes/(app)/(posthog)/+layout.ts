import { fetchAPI } from '$lib/client/api/index'
import { domain, full_user } from '$lib/shared/schema'
import posthog from 'posthog-js'

import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const full_userwithdomainmap = full_user.extend({
	domains: z.record(z.string(), domain)
})

export async function load({ fetch, depends, data }) {
	const authR = await fetchAPI(`/me/full`, { fetch })
	depends('app:auth')
	const auth: Zod.infer<typeof full_user> | null = authR.ok ? await authR.json() : null
	const domainMap = auth?.domains
		? Object.fromEntries(
				Object.entries(Object.groupBy(auth.domains, ({ name }) => name)).map(
					([k, v]) => [k, domain.parse(v?.[0])] as const
				)
			)
		: null
	posthog.reset()
	if(auth) posthog.identify(auth.user.github_id, {
		name: auth.user.name,
		github_id: auth.user.github_id
	})
	return {
		commitID: data.commitID,
		auth: auth
			? {
					...auth,
					domains: domainMap
				}
			: null
	} as { auth?: Zod.infer<typeof full_userwithdomainmap> }
}

export const csr = true
export const ssr = false
