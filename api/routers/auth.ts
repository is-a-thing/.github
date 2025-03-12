import { initWooter } from '$util/middleware/index.ts'
import { c } from '@bronti/wooter'

import { generateState, OAuth2Tokens } from 'arctic'
import github from '$auth/github.ts'
import { DEV, GITHUB_API, MAINPAGE } from '$util/env.ts'
import {
	errorResponse,
	redirectResponse,
} from '@bronti/wooter/util'
import {
	createSession,
	generateSessionToken,
	invalidateSession,
} from '$auth/index.ts'
import posthog from '$util/posthog.ts'

// @deno-types="@types/luxon"
import { DateTime } from 'luxon'
import { db } from '$db/index.ts'
const isValidPath = (next: string) => /^\/[a-zA-Z0-9\-._~\/]*$/.test(next)

export function authNamespace(wooter: ReturnType<typeof initWooter>) {
	interface GitHubUser {
		id: number
		login: string
		name: string
		created_at: string
	}

	wooter.route.GET(
		c.chemin('code', c.pString('code')),
		async ({ resp, params: { code } }) => {
			const session = await db.auth.code.find(code)
			if (session) {
				await db.auth.code.delete(code)
				resp(Response.json({ ok: true, data: session.value }))
			} else {
				resp(Response.json({ ok: false, msg: 'not_found' }))
			}
		},
	)

	wooter.route.POST(
		c.chemin('logout'),
		async ({ data: { ensureAuth, deleteSession }, resp }) => {
			const { session, user } = ensureAuth()
			deleteSession()
			await invalidateSession(session.id)
			posthog.capture({
				distinctId: user.github_id,
				event: 'user logged out',
			})
			resp(new Response('ok'))
		},
	)

	wooter.route.GET(c.chemin(), ({ data: { cookies }, resp, url }) => {
		const next = url.searchParams.get('next')
		if (next && !isValidPath(next)) {
			resp(errorResponse(400, 'Invalid redirect'))
		}
		const state = generateState()
		const redirurl = github.createAuthorizationURL(state, [])

		cookies.set('oauth_state', state, {
			path: '/',
			secure: DEV !== 'true',
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax',
		})

		if (next) {
			cookies.set('next_path', next, {
				path: '/',
				secure: DEV !== 'true',
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: 'lax',
			})
		}

		resp(redirectResponse(redirurl.toString(), { status: 302 }))
	})

	wooter.route.GET(
		c.chemin('callback'),
		async ({ data: { cookies }, resp, url }) => {
			const code = url.searchParams.get('code')
			const state = url.searchParams.get('state')
			const storedState = cookies.get('oauth_state') ?? null
			const next = cookies.get('next_path') ?? '/'
			const redirect = new URL(`${MAINPAGE}${next}`)

			cookies.delete('oauth_state', {
				path: '/',
				secure: true,
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: 'lax',
			})
			cookies.delete('next_path', {
				path: '/',
				secure: true,
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: 'lax',
			})
			if (!code || !state || !storedState || state !== storedState) {
				redirect.searchParams.set('msg', 'broken_state')
				return resp(
					redirectResponse(redirect),
				)
			}
			let tokens: OAuth2Tokens

			try {
				tokens = await github.validateAuthorizationCode(code)
			} catch {
				redirect.searchParams.set('msg', 'code_validation')
				return resp(
					redirectResponse(redirect),
				)
			}

			try {
				const githubUserResponse = await fetch(`${GITHUB_API}/user`, {
					headers: {
						Authorization: `Bearer ${tokens.accessToken()}`,
					},
				})

				const githubUser: GitHubUser = await githubUserResponse.json()
				const daysSinceJoin = DateTime.now().diff(
					DateTime.fromISO(githubUser.created_at),
					'days',
				).days
				if (daysSinceJoin < 90) {
					redirect.searchParams.set('msg', 'account_too_new')
					return resp(
						// errorResponse(
						// 	400,
						// 	'Github account must be at least 90 days old',
						// ),
						redirectResponse(redirect),
					)
				}

				const existingUser =
					(await db.auth.user.find(githubUser.id.toString()))?.flat()
				if (!existingUser) {
					await db.auth.user.add({
						github_id: githubUser.id.toString(),
						domain_slot_override: undefined,
						name: githubUser.name,
					})
					posthog.capture({
						distinctId: githubUser.id.toString(),
						event: 'user signed up',
					})
				} else {
					posthog.capture({
						distinctId: githubUser.id.toString(),
						event: 'user logged in',
					})
				}

				const token = generateSessionToken()
				const sessionOption = await createSession(
					githubUser.id.toString(),
					token,
				)
				if (sessionOption.isNone()) {
					resp(errorResponse(500, 'Error creating session'))
				}
				const code = generateState()
				db.auth.code.set(code, token)
				redirect.searchParams.set('code', code)
				resp(redirectResponse(redirect))
			} catch (e) {
				console.error(e)
				resp(errorResponse(500, 'Unknown Error'))
			}
		},
	)
}
