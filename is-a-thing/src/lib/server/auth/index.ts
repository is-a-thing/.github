import { dev } from '$app/environment'

import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { None, type Option, Some } from '@oxi/option'
import type { Cookies } from '@sveltejs/kit'
import type { z } from 'zod'

import { db, schema } from '../db'

export type Session = z.infer<typeof schema.session>
export type User = z.infer<typeof schema.user>

const expireTime = 1000 * 60 * 60 * 24 * 15

const dbHelpers = {
	async deleteSession(sessionId: string): Promise<void> {
		await db.auth.session.delete(sessionId)
	},
	async deleteUserSessions(userId: string): Promise<void> {
		await db.auth.session.deleteBySecondaryIndex('userId', userId)
	},
	async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		await db.auth.session.update(
			sessionId,
			{
				expiresAt
			},
			{
				expireIn: expiresAt.getTime() - new Date().getTime()
			}
		)
	},
	async setSession(session: z.infer<typeof schema.session>): Promise<Option<Session>> {
		const res = await db.auth.session.add(session, {
			expireIn: session.expiresAt.getTime() - new Date().getTime()
		})
		if (res.ok) {
			return Some(session)
		}
		return None
	},
	async getUserSessions(userId: string): Promise<Session[]> {
		const sessions = await db.auth.session.findBySecondaryIndex('userId', userId)
		return sessions.result.map((v) => v.value)
	},
	async getSessionAndUser(sessionId: string): Promise<[Session, User] | [undefined, undefined]> {
		const session = (await db.auth.session.find(sessionId))?.value
		const user = session?.userId ? (await db.auth.user.find(session.userId))?.value : undefined
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

function sessionIdFromToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
}

export async function createSession(userId: string, token: string): Promise<Option<Session>> {
	const id = sessionIdFromToken(token)
	const res = await dbHelpers.setSession({
		id,
		userId,
		expiresAt: new Date(Date.now() + expireTime)
	})
	return res
}

export type AuthPair = { session: Session; user: User }

export async function validateSessionToken(token: string): Promise<Option<AuthPair>> {
	const sessionId = sessionIdFromToken(token)
	const [session, user] = await dbHelpers.getSessionAndUser(sessionId)
	if (!session) return None
	if (Date.now() >= session.expiresAt.getTime()) {
		dbHelpers.deleteSession(sessionId)
		return None
	}
	session.expiresAt = new Date(Date.now() + expireTime)
	dbHelpers.updateSessionExpiration(sessionId, session.expiresAt)
	return Some({ session, user })
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await dbHelpers.deleteSession(sessionId)
}

export async function createSessionCookie(token: string, cookies: Cookies) {
	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: expireTime,
		path: '/',
		secure: !dev
	})
}

export async function deleteSessionCookie(cookies: Cookies) {
	cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/',
		secure: !dev
	})
}
