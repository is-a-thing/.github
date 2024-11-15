let openKv: typeof import("@deno/kv")['openKv'];
if(globalThis.doDenoKvNPM) {
	openKv = (await import("@deno/kv"))['openKv']
} else {
	openKv = Deno.openKv
}

import { collection, kvdex } from '@olli/kvdex'
import * as schema from './schema'
import { dev } from '$app/environment';

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
