export function load({ params: { page } }) {
	return { page }
}

export const prerender = true
export const csr = false
export const trailingSlash = 'never'
