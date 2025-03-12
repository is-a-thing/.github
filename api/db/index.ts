import { DEV } from '$util/env.ts'

import { collection, kvdex, model } from '@olli/kvdex'
import * as schema from '$shared/schema.ts'

export { schema }

const kv = await Deno.openKv(
	DEV === 'true' ? 'http://localhost:4512' : undefined,
)

export const db = kvdex({
	kv,
	schema: {
		auth: {
			user: collection(schema.user, {
				idGenerator: ({ github_id }) => github_id,
			}),
			session: collection(schema.session, {
				indices: {
					user_id: 'secondary',
					id: 'primary',
				},
				idGenerator: ({ id }) => id,
			}),
			/**
			 * Used to store the authorization codes that map to session IDs.
			 */
			code: collection(model<string>()),
		},
		domain: collection(schema.domain, {
			indices: {
				owner_id: 'secondary',
			},
			idGenerator: ({ name }) => name,
		}),
	},
})
