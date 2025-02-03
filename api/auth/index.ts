import { DEV } from '$util/env.ts'

import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { None, type Option, Some } from '@oxi/option'
import type { z } from 'zod'

import { db, schema } from '$db/index.ts'
import { Cookies } from '$util/middleware/cookies.ts'

export type Session = z.infer<typeof schema.session>
export type User = z.infer<typeof schema.user>

const expire_time = 1000 * 60 * 60 * 24 * 15

const dbHelpers = {
	async deleteSession(session_id: string): Promise<void> {
		await db.auth.session.delete(session_id)
	},
	async deleteUserSessions(user_id: string): Promise<void> {
		await db.auth.session.deleteBySecondaryIndex('user_id', user_id)
	},
	async updateSessionExpiration(session_id: string, expires_at: Date): Promise<void> {
		await db.auth.session.update(
			session_id,
			{
				expires_at
			},
			{
				expireIn: expires_at.getTime() - new Date().getTime()
			}
		)
	},
	async setSession(session: z.infer<typeof schema.session>): Promise<Option<Session>> {
		const res = await db.auth.session.add(session, {
			expireIn: session.expires_at.getTime() - new Date().getTime()
		})
		if (res.ok) {
			return Some(session)
		}
		return None
	},
	async getUserSessions(user_id: string): Promise<Session[]> {
		const sessions = await db.auth.session.findBySecondaryIndex('user_id', user_id)
		return sessions.result.map((v) => v.value)
	},
	async getSessionAndUser(session_id: string): Promise<[Session, User] | [undefined, undefined]> {
		const session = (await db.auth.session.find(session_id))?.value
		const user = session?.user_id ? (await db.auth.user.find(session.user_id))?.value : undefined
        // @ts-expect-error: If session is undefined, user will automatically be undefined
		return [session, user]
	}
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

function session_idFromToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
}

export async function createSession(user_id: string, token: string): Promise<Option<Session>> {
	const id = session_idFromToken(token)
	const res = await dbHelpers.setSession({
		id,
		user_id,
		expires_at: new Date(Date.now() + expire_time)
	})
	return res
}

export type AuthPair = { session: Session; user: User }

export async function validateSessionToken(token: string): Promise<Option<AuthPair>> {
	const session_id = session_idFromToken(token)
	const [session, user] = await dbHelpers.getSessionAndUser(session_id)
	if (!session) return None
	if (Date.now() >= session.expires_at.getTime()) {
		dbHelpers.deleteSession(session_id)
		return None
	}
	session.expires_at = new Date(Date.now() + expire_time)
	dbHelpers.updateSessionExpiration(session_id, session.expires_at)
	return Some({ session, user })
}

export async function invalidateSession(session_id: string): Promise<void> {
	await dbHelpers.deleteSession(session_id)
}

export function createSessionCookie(token: string, cookies: Cookies) {
	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'none',
		maxAge: expire_time,
		path: '/',
		secure: true
	})
}

export function deleteSessionCookie(cookies: Cookies) {
	cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'none',
		maxAge: 0,
		path: '/',
		secure: true
	})
}
