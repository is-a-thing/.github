import { c } from "@bronti/wooter"
import { wooter } from '$util/middleware/index.ts'
import { generateState, OAuth2Tokens } from 'arctic'
import github from '$auth/github.ts'
import { DEV, GITHUB_API, MAINPAGE } from '$util/env.ts'
import { errorResponse, jsonResponse, redirectResponse } from '@bronti/wooter/util'

// @deno-types="@types/luxon"
import { DateTime } from "luxon"
import { db } from '$db/index.ts'
import { AuthPair, createSession, createSessionCookie, generateSessionToken, deleteSessionCookie } from '$auth/index.ts'
import { checkDomainName } from '$util/domain.ts'
import { invalidateSession } from '$auth/index.ts'
import { domainCount } from '$db/fn.ts'

const isValidPath = (next: string) => /^\/[a-zA-Z0-9\-._~\/]*$/.test(next);

const DOMAIN_LIMIT = 6

const app = wooter()
    .namespace(c.chemin('auth'), wooter => wooter.useMethods(), wooter => {
        interface GitHubUser {
            id: number
            login: string
            name: string
            created_at: string
        }

        wooter.POST(c.chemin('logout'), async ({ data: { cookies, ensureAuth }, resp }) => {
            const { session } = ensureAuth()
            deleteSessionCookie(cookies)
            await invalidateSession(session.id)
            resp(new Response('ok'))
        })

        wooter.GET(c.chemin(), async ({ data: { cookies }, resp, url }) => {
            const next = url.searchParams.get('next');
            if(next && !isValidPath(next)) {
                resp(errorResponse(400, "Invalid redirect"))
            }
            const state = generateState()
            const redirurl = github.createAuthorizationURL(state, [])

            cookies.set('oauth_state', state, {
                path: '/',
                secure: DEV !== 'true',
                httpOnly: true,
                maxAge: 60 * 10,
                sameSite: 'lax'
            })

            if(next) {
                cookies.set('next_path', next, {
                    path: '/',
                    secure: DEV !== 'true',
                    httpOnly: true,
                    maxAge: 60 * 10,
                    sameSite: 'lax'
                })
            }

            resp(redirectResponse(redirurl.toString(), { status: 302 }))
        })


        wooter.GET(c.chemin('callback'), async ({ data: { cookies }, resp, url }) => {
            const code = url.searchParams.get('code')
            const state = url.searchParams.get('state')
            const storedState = cookies.get('oauth_state') ?? null
            const next = cookies.get('next_path') ?? '/'
            cookies.delete('oauth_state', {
                path: '/',
                secure: true,
                httpOnly: true,
                maxAge: 60 * 10,
                sameSite: 'lax'
            })
            cookies.delete('next_path', {
                path: '/',
                secure: true,
                httpOnly: true,
                maxAge: 60 * 10,
                sameSite: 'lax'
            })
            if (!code || !state || !storedState || state !== storedState) {
                return resp(errorResponse(400, 'Invalid State'))
            }
            let tokens: OAuth2Tokens

            try {
                tokens = await github.validateAuthorizationCode(code)
            } catch {
                return resp(errorResponse(400, 'Unable to validate'))
            }

            try {
                const githubUserResponse = await fetch(`${GITHUB_API}/user`, {
                    headers: {
                        Authorization: `Bearer ${tokens.accessToken()}`
                    }
                })

                const githubUser: GitHubUser = await githubUserResponse.json()
                const daysSinceJoin = DateTime.now().diff(DateTime.fromISO(githubUser.created_at), 'days').days
                if (daysSinceJoin < 90) {
                    return resp(errorResponse(400, 'Github account must be at least 90 days old'))
                }

                const existingUser = (await db.auth.user.find(githubUser.id.toString()))?.flat()
                if (!existingUser) {
                    await db.auth.user.add({
                        github_id: githubUser.id.toString(),
                        domain_slot_override: undefined,
                        name: githubUser.name
                    })
                }

                const token = generateSessionToken()
                const sessionOption = await createSession(githubUser.id.toString(), token)
                if (sessionOption.isNone()) {
                    resp(errorResponse(500, 'Error creating session'))
                }

                createSessionCookie(token, cookies)

                resp(redirectResponse(`${MAINPAGE}${next}`))
            } catch (e) {
                console.error(e)
                resp(errorResponse(500, 'Unknown Error'))
            }
        })
    })
    .namespace(c.chemin('me'), wooter => wooter.use<{ auth: AuthPair }>(async ({ up, data: { ensureAuth } }) => {
        const auth = ensureAuth()
        await up({ auth })
    }).useMethods(), wooter => {
        wooter.GET(c.chemin(), async ({ resp, data: { auth } }) => {
            resp(jsonResponse(auth.user))
        })

        wooter.GET(c.chemin('domains'), async ({ resp, data: { auth } }) => {
            const { result } = await db.domain.findBySecondaryIndex('owner_id', auth.user.github_id)
            resp(jsonResponse(result.map(domain => {
                return domain.value
            })))
        })

        wooter.GET(c.chemin('domaincount'), async ({ resp, data: { auth } }) => {
            resp(jsonResponse(await domainCount(auth.user.github_id)))
        })

        wooter.GET(c.chemin('slots'), async ({ resp, data: { auth } }) => {
            resp(jsonResponse(auth.user.domain_slot_override ?? DOMAIN_LIMIT))
        })
    })
    .namespace(c.chemin('domains'), wooter => wooter.useMethods(), wooter => {
        wooter.GET(c.chemin('available', c.pString('domain')), async ({ params: { domain }, resp }) => {
            if(!checkDomainName(domain)) return resp(jsonResponse(false))
            const result = await db.domain.find(domain)
            if(result) return resp(jsonResponse(false))
            resp(jsonResponse(true))
        })

        wooter.POST(c.chemin('get', c.pString('name')), async ({ data: { ensureAuth }, resp, params: { name } }) => {
            const { user } = ensureAuth()
            const domain_count = await domainCount(user.github_id)
            const domain_limit = user.domain_slot_override ?? DOMAIN_LIMIT

            if(domain_limit >= domain_count) return resp(jsonResponse({ ok: false, msg: "domain_limit" }, { status: 400 }))
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
    })

export default { fetch: app.fetch };