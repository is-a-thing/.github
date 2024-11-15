import { dev } from '$app/environment'

import { openKv } from '@deno/kv'
import { collection, kvdex } from '@olli/kvdex'

import * as schema from './schema'

export { schema }

const kv = await openKv(dev ? 'http://localhost:4512' : undefined)

export const db = kvdex(kv, {
	auth: {
		user: collection(schema.user, {
			indices: {
				githubId: 'primary'
			},
			idGenerator: ({ githubId }) => githubId
		}),
		session: collection(schema.session, {
			indices: {
				userId: 'secondary',
				id: 'primary'
			},
			idGenerator: ({ id }) => id
		})
	},
	domain: collection(schema.domain, {
		indices: {
			ownerId: 'secondary',
			name: 'primary'
		},
		idGenerator: ({ name }) => name
	})
})
