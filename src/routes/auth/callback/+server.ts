import lucia from '$lib/server/auth';
import github from '$lib/server/auth/github';
import { db } from '$lib/server/db';

import { error, isHttpError } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { generateIdFromEntropySize } from 'lucia';
import { DateTime } from 'luxon';

export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state') ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		error(400, 'Invalid state');
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();
		const daysSinceJoin = DateTime.now().diff(DateTime.fromISO(githubUser.created_at), 'days').days
        if(daysSinceJoin < 90) {
            error(400, "Github account must be at least 90 days old")
        }
		const existingUser = (await db.auth.user.find(githubUser.id.toString()))?.flat();

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateIdFromEntropySize(10);

			await db.auth.user.add({
				githubId: githubUser.id.toString(),
				domainSlots: 3,
				name: githubUser.name,
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
        if(isHttpError(e)) throw e;
		console.error(e);
		if (e instanceof OAuth2RequestError) {
			error(400, 'OAuth Error');
		}
		error(500, 'Unknown Error');
	}
}

interface GitHubUser {
	id: number;
	login: string;
	name: string;
	created_at: string;
}
