import { DEV } from '$util/env.ts'

import { collection, kvdex } from '@olli/kvdex'
import * as schema from "$shared/schema.ts"

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
					github_id: 'primary',
				},
				idGenerator: ({ github_id }) => github_id,
			}),
			session: collection(schema.session, {
				indices: {
					user_id: 'secondary',
					id: 'primary',
				},
				idGenerator: ({ id }) => id,
			}),
		},
		domain: collection(schema.domain, {
			indices: {
				owner_id: 'secondary',
				name: 'primary',
			},
			idGenerator: ({ name }) => name,
		}),
	},
})
