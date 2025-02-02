import { authHandle } from '$lib/server/auth/handle'

import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(authHandle)
