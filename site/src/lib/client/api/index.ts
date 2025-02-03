export const fetchAPI = (input: RequestInfo | URL, init?: RequestInit, _fetch?: typeof globalThis.fetch) => {
    const fetch = _fetch ?? globalThis.fetch
    return fetch(input, {
        ...init,
        credentials: 'include'
    })
}