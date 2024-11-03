import api from '$lib/server/api'

export const fallback = ({ request }) => api.fetch(request)
