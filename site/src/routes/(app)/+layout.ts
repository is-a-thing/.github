import { fetchAPI } from '$lib/client/api/index'
import { full_user } from '$lib/shared/schema'

export async function load({ fetch, depends }) {
	const authR = await fetchAPI(`/me/full`, { fetch })
	depends('app:auth')
	const auth: Zod.infer<typeof full_user> | null = (authR.ok ? await authR.json() : null)
	return {
		auth,
	}
}

export const csr = true
export const ssr = false
