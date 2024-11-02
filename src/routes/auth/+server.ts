import github from '$lib/server/auth/github'

import { redirect } from '@sveltejs/kit'
import { generateState } from 'arctic'

export async function GET({ cookies }) {
	const state = generateState()
	const url = await github.createAuthorizationURL(state)

	cookies.set('oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	})

	redirect(302, url.toString())
}
