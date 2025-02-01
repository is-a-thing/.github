import api from '$lib/server/api'

export const fallback = ({ request, locals }) => api.fetch(request, { locals })
