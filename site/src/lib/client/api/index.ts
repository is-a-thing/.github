export const fetchAPI: typeof fetch = (input, init) => {
    return fetch(input, {
        ...init,
        credentials: 'include'
    })
} 