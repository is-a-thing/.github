import { DEV } from '$util/env.ts'

import { collection, kvdex } from '@olli/kvdex'
import * as schema from '$db/schema.ts'

export { schema }

const kv = await Deno.openKv(
	DEV === 'true' ? 'http://localhost:4512' : undefined,
)

export const db = kvdex({
	kv,
	schema: {
		auth: {
			user: collection(schema.user, {
				indices: {
					githubId: 'primary',
				},
				idGenerator: ({ githubId }) => githubId,
			}),
			session: collection(schema.session, {
				indices: {
					userId: 'secondary',
					id: 'primary',
				},
				idGenerator: ({ id }) => id,
			}),
		},
		domain: collection(schema.domain, {
			indices: {
				ownerId: 'secondary',
				name: 'primary',
			},
			idGenerator: ({ name }) => name,
		}),
	},
})
