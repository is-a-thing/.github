import { dev } from '$app/environment'
import { createSession, createSessionCookie, generateSessionToken } from '$lib/server/auth'
import github from '$lib/server/auth/github'
import { db } from '$lib/server/db'

import { error, isHttpError } from '@sveltejs/kit'
import { OAuth2RequestError, type OAuth2Tokens } from 'arctic'
import { DateTime } from 'luxon'

export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const storedState = cookies.get('oauth_state') ?? null
	cookies.delete('oauth_state', {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	})
	if (!code || !state || !storedState || state !== storedState) {
		error(400, 'Invalid state')
	}
	let tokens: OAuth2Tokens

	try {
		tokens = await github.validateAuthorizationCode(code)
	} catch {
		error(400, 'Unable to validate')
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
			error(400, 'Github account must be at least 90 days old')
		}

		const existingUser = (await db.auth.user.find(githubUser.id.toString()))?.flat()
		if (!existingUser) {
			await db.auth.user.add({
				githubId: githubUser.id.toString(),
				domainSlots: 3,
				name: githubUser.name
			})
		}

		const token = generateSessionToken()
		const sessionOption = await createSession(githubUser.id.toString(), token)
		if (sessionOption.isNone()) {
			error(500, 'Error creating session')
		}

		createSessionCookie(token, cookies)

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		})
	} catch (e) {
		if (isHttpError(e)) throw e
		console.error(e)
		if (e instanceof OAuth2RequestError) {
			error(400, 'OAuth Error')
		}
		error(500, 'Unknown Error')
	}
}

interface GitHubUser {
	id: number
	login: string
	name: string
	created_at: string
}
