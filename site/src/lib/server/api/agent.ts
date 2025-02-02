import { hc } from 'hono/client'

import type { api } from './'

export default function (fetch: typeof globalThis.fetch) {
	return hc<api>('/api', { fetch })
}
