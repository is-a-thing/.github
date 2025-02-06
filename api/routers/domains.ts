import { initWooter } from '$util/middleware/index.ts'
import { c } from '@bronti/wooter'
import { checkDomainName } from '$util/domain.ts'
import { jsonResponse } from '@bronti/wooter/util'
import { db } from '$db/index.ts'
import { domainCount, domainSlots } from '$db/fn.ts'

export function domainsRouter(wooter: ReturnType<typeof initWooter>) {
    wooter.GET(c.chemin('available', c.pString('domain')), async ({ params: { domain }, resp }) => {
        if(!checkDomainName(domain)) return resp(jsonResponse(false))
        const result = await db.domain.find(domain)
        if(result) return resp(jsonResponse(false))
        resp(jsonResponse(true))
    })

    wooter.POST(c.chemin('get', c.pString('name')), async ({ data: { ensureAuth }, resp, params: { name } }) => {
        const { user } = ensureAuth()
        const domain_count = await domainCount(user.github_id)
        const domain_limit = domainSlots(user.domain_slot_override)

        if(domain_count >= domain_limit) return resp(jsonResponse({ ok: false, msg: "domain_limit" }, { status: 400 }))
        db.domain.add({
            name,
            owner_id: user.github_id,
            active: true,
            activated_at: new Date(),
            NS_records: [],
            last_push: undefined,
            current_value_pushed: false,
        })

        resp(jsonResponse({ ok: true }))
    })
}