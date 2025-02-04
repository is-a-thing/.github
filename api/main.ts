import { c } from "@bronti/wooter"
import { wooter } from '$util/middleware/index.ts'
import { generateState, OAuth2Tokens } from 'arctic'
import github from '$auth/github.ts'
import { DEV, GITHUB_API, MAINPAGE } from '$util/env.ts'
import { errorResponse, jsonResponse, redirectResponse } from '@bronti/wooter/util'

// @deno-types="@types/luxon"
import { DateTime } from "luxon"
import { db } from '$db/index.ts'
import { AuthPair, createSession, createSessionCookie, generateSessionToken } from '$auth/index.ts'

const app = wooter()
    .namespace(c.chemin('auth'), wooter => wooter.useMethods(), wooter => {
        interface GitHubUser {
            id: number
            login: string
            name: string
            created_at: string
        }

        if(DEV === 'true') {
            wooter.GET(c.chemin('cookie', c.pString('session')), async ({ resp, data: { cookies }, params: { session } }) => {
                createSessionCookie(session, cookies)
                resp(redirectResponse('/auth/me', {
                    status: 302
                }))
            })
        }

        wooter.GET(c.chemin(), async ({ data: { cookies }, resp, }) => {
            const state = generateState()
            const url = github.createAuthorizationURL(state, [])

            cookies.set('oauth_state', state, {
                path: '/',
                secure: DEV !== 'true',
                httpOnly: true,
                maxAge: 60 * 10,
                sameSite: 'lax'
            })

            resp(redirectResponse(url.toString(), { status: 302 }))
        })


        wooter.GET(c.chemin('callback'), async ({ data: { cookies }, resp, url }) => {
            const code = url.searchParams.get('code')
            const state = url.searchParams.get('state')
            const storedState = cookies.get('oauth_state') ?? null
            cookies.delete('oauth_state', {
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
                const githubUserResponse = await fetch('https://api.github.com/user', {
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
                        domain_slots: 3,
                        name: githubUser.name
                    })
                }

                const token = generateSessionToken()
                const sessionOption = await createSession(githubUser.id.toString(), token)
                if (sessionOption.isNone()) {
                    resp(errorResponse(500, 'Error creating session'))
                }

                createSessionCookie(token, cookies)

                resp(redirectResponse(`${MAINPAGE}`))
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
    })

export default { fetch: app.fetch };