import { goto, invalidate } from '$app/navigation'
import { env } from '$env/dynamic/public'

const { PUBLIC_API } = env

export const publicApi = PUBLIC_API

export const fetchAPI = (
	path: string,
	method?: string,
	init?: RequestInit,
	_fetch?: typeof globalThis.fetch
) => {
	const fetch = _fetch ?? globalThis.fetch
	return fetch(`${PUBLIC_API}${path}`, {
		...init,
		method,
		credentials: 'include'
	})
}

export const logout = async () => {
	await fetchAPI('/auth/logout', 'POST')
	await goto('/')
	await invalidate('app:auth')
}
