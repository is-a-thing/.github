import { initWooter } from '$util/middleware/index.ts'
import { AuthPair } from '$auth/index.ts'
import { c } from '@bronti/wooter'
import { jsonResponse } from '@bronti/wooter/util'
import { domainCount, domainSlots, getDomainsByUser } from '$db/fn.ts'
import { full_user } from '$shared/schema.ts'

export function mePreRouter(wooter: ReturnType<typeof initWooter>) {
	return wooter.use<{ auth: AuthPair }>(
		async ({ up, data: { ensureAuth } }) => {
			const auth = ensureAuth()
			await up({ auth })
		},
	)
}

export function meRouter(wooter: ReturnType<typeof mePreRouter>) {
	wooter.route.GET(c.chemin(), ({ resp, data: { auth } }) => {
		resp(jsonResponse(auth.user))
	})

	wooter.route.GET(c.chemin('domains'), async ({ resp, data: { auth } }) => {
		resp(jsonResponse(await getDomainsByUser(auth.user.github_id)))
	})

	wooter.route.GET(c.chemin('domaincount'), async ({ resp, data: { auth } }) => {
		resp(jsonResponse(await domainCount(auth.user.github_id)))
	})

	wooter.route.GET(c.chemin('slots'), ({ resp, data: { auth } }) => {
		resp(jsonResponse(domainSlots(auth.user.domain_slot_override)))
	})

	wooter.route.GET(c.chemin('full'), async ({ resp, data: { auth } }) => {
		const fullUser: Zod.infer<typeof full_user> = {
			domains: await getDomainsByUser(auth.user.github_id),
			user: auth.user,
			slots: domainSlots(auth.user.domain_slot_override),
		}
		resp(jsonResponse(fullUser))
	})
}
