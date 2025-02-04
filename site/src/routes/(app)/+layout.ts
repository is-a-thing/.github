import { fetchAPI } from '$lib/client/api/index.js'
import { user } from '$lib/shared/schema'

import type { z } from 'zod'

export async function load({ fetch, depends }) {
	const userR = await fetchAPI(`/me`, { fetch })
	depends('app:auth')
	const usr = (userR.ok ? await userR.json() : null) as z.infer<typeof user> | null
	return {
		user: usr
	}
}

export const csr = true
export const ssr = false
