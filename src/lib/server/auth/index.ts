import { dev } from '$app/environment'

import { type DatabaseSession, Lucia } from 'lucia'
import type { z } from 'zod'

import { db, schema } from '../db'

function databaseSession(session: z.infer<typeof schema.session>): DatabaseSession {
	return { ...session, attributes: {} }
}

const lucia = new Lucia(
	{
		async deleteSession(sessionId) {
			await db.auth.session.delete(sessionId)
		},
		async deleteUserSessions(userId) {
			await db.auth.session.deleteBySecondaryIndex('userId', userId)
		},
		async updateSessionExpiration(sessionId, expiresAt) {
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
		async setSession(session) {
			await db.auth.session.add({
				id: session.id,
				expiresAt: session.expiresAt,
				userId: session.userId
			})
		},
		async deleteExpiredSessions() {},
		async getUserSessions(userId) {
			const sessions = await db.auth.session.findBySecondaryIndex('userId', userId)
			return sessions.result.map((d) => databaseSession(d.value))
		},
		async getSessionAndUser(sessionId) {
			const session = (await db.auth.session.find(sessionId))?.value
			const user = session?.userId ? (await db.auth.user.find(session.userId))?.value : undefined
			return [
				session ? databaseSession(session) : null,
				user ? { id: user?.githubId, attributes: user } : null
			]
		}
	},
	{
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		}
	}
)

export default lucia

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: z.infer<typeof schema.user>
	}
}
