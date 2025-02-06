import { initWooter } from '$util/middleware/index.ts'
import { AuthPair } from '$auth/index.ts'
import { c } from '@bronti/wooter'
import { jsonResponse } from '@bronti/wooter/util'
import { domainCount, domainSlots, getDomainsByUser } from '$db/fn.ts'
import { full_user } from '$shared/schema.ts'

export function mePreRouter(wooter: ReturnType<typeof initWooter>) {
    return wooter.use<{ auth: AuthPair }>(async ({ up, data: { ensureAuth } }) => {
        const auth = ensureAuth()
        await up({ auth })
    }).useMethods()
}

export function meRouter(wooter: ReturnType<typeof mePreRouter>) {
    console.log(wooter)
    wooter.GET(c.chemin(), async ({ resp, data: { auth } }) => {
        resp(jsonResponse(auth.user))
    })

    wooter.GET(c.chemin('domains'), async ({ resp, data: { auth } }) => {
        resp(jsonResponse(await getDomainsByUser(auth.user.github_id)))
    })

    wooter.GET(c.chemin('domaincount'), async ({ resp, data: { auth } }) => {
        resp(jsonResponse(await domainCount(auth.user.github_id)))
    })

    wooter.GET(c.chemin('slots'), async ({ resp, data: { auth } }) => {
        resp(jsonResponse(domainSlots(auth.user.domain_slot_override)))
    })

    wooter.GET(c.chemin('full'), async ({ resp, data: { auth } }) => {
        const fullUser: Zod.infer<typeof full_user> = {
            domains: await getDomainsByUser(auth.user.github_id),
            user: auth.user,
            slots: domainSlots(auth.user.domain_slot_override),
        }
        resp(jsonResponse(fullUser))
    })
}