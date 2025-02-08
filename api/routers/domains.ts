import { initWooter } from '$util/middleware/index.ts'
import { c } from '@bronti/wooter'
import { checkDomainName } from '$util/domain.ts'
import { jsonResponse } from '@bronti/wooter/util'
import { db } from '$db/index.ts'
import { domainCount, domainSlots } from '$db/fn.ts'
import { domainSettings } from '$shared/schema.ts'
import { setRRSet } from '$util/desec.ts'
import { AuthPair } from '$auth/index.ts'
import { Option } from '@oxi/option'

function isAdmin(pair: Option<AuthPair>) {
	return pair.isSome() && pair.unwrap().user.github_id === '76607214'
}

export function domainsRouter(wooter: ReturnType<typeof initWooter>) {
	wooter.GET(
		c.chemin('available', c.pString('name')),
		async ({ params: { name }, resp, data: { auth } }) => {
			if (!isAdmin(auth) && !checkDomainName(name)) return resp(jsonResponse(false))
			const result = await db.domain.find(name)
			if (result) return resp(jsonResponse(false))
			resp(jsonResponse(true))
		},
	)

	wooter.POST(
		c.chemin('get', c.pString('name')),
		async ({ data: { ensureAuth, auth }, resp, params: { name } }) => {
			const { user } = ensureAuth()
			const domain_count = await domainCount(user.github_id)
			const domain_limit = domainSlots(user.domain_slot_override)

            if(!isAdmin(auth) && !checkDomainName(name)) {
                return resp(
                    jsonResponse({ ok: false, msg: 'invalid_domain' }, {
                        status: 400,
                    })
                )
            }

			if (!isAdmin(auth) && domain_count >= domain_limit) {
				return resp(
					jsonResponse({ ok: false, msg: 'domain_limit' }, {
						status: 400,
					}),
				)
			}
			await db.domain.add({
				name,
				owner_id: user.github_id,
				activated_at: new Date(),
				NS_records: [],
				last_push: undefined,
				current_value_pushed: false,
			})

			resp(jsonResponse({ ok: true }))
		},
	)

	wooter.namespace(
		c.chemin('settings', c.pString('name')),
		(wooter) => wooter.useMethods(),
		(wooter) => {
			wooter.POST(
				c.chemin(),
				async (
					{ data: { ensureAuth, json }, resp, params: { name } },
				) => {
					const { user } = ensureAuth()
					const { NS_records } = await json(domainSettings)
					const domain = await db.domain.find(name)
					if (!domain) {
						return resp(
							jsonResponse({ ok: false, msg: 'not_found' }, {
								status: 400,
							}),
						)
					}
					if (domain.value.owner_id !== user.github_id) {
						return resp(
							jsonResponse({ ok: false, msg: 'not_owner' }, {
								status: 400,
							}),
						)
					}

					db.domain.update(name, {
						NS_records,
						last_push: undefined,
						current_value_pushed: false,
					}, { strategy: 'merge' })
				},
			)

			wooter.POST(
				c.chemin('push'),
				async ({ resp, params: { name }, data: { ensureAuth } }) => {
					const { user } = ensureAuth()
					const domain = await db.domain.find(name)
					if (!domain) {
						return resp(
							jsonResponse({ ok: false, msg: 'not_found' }, {
								status: 400,
							}),
						)
					}
					if (domain.value.owner_id !== user.github_id) {
						return resp(
							jsonResponse({ ok: false, msg: 'not_owner' }, {
								status: 400,
							}),
						)
					}
                    if(domain.value.NS_records.length === 0) {
                        return resp(jsonResponse({ ok: false, msg: 'no_records' }, {
                            status: 400
                        }))
                    }
					if (
						domain.value.last_push &&
						new Date().getTime() -
									domain.value.last_push.getTime() <
							15 * 60 * 1000
					) {
						return resp(
							jsonResponse({ ok: false, msg: 'too_frequent' }, {
								status: 400,
							}),
						)
					}
					const res = await setRRSet(name, domain.value.NS_records)
					if (res.isOk()) {
						db.domain.update(name, {
							last_push: new Date(),
							current_value_pushed: true,
						}, { strategy: 'merge' })
						resp(jsonResponse({ ok: true }))
					} else {
						resp(
							jsonResponse({
								ok: false,
								msg: res.unwrapErr().statusText,
							}, { status: 400 }),
						)
					}
				},
			)
		},
	)
}
