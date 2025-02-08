import { goto, invalidate } from '$app/navigation'
import { PUBLIC_API } from '$env/static/public'

export const publicApi = PUBLIC_API

export const fetchAPI = (
	path: string,
	opts?: {
		init?: RequestInit
		fetch?: typeof globalThis.fetch
	}
) => {
	const fetch = opts?.fetch ?? globalThis.fetch
	return fetch(`${PUBLIC_API}${path}`, {
		...opts?.init,
		credentials: 'include'
	})
}

export const logout = async () => {
	await fetchAPI('/auth/logout', {
		init: {
			method: 'POST'
		}
	})
	await goto('/')
	await invalidate('app:auth')
}
