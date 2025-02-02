import type { api } from '$lib/server/api'

import { hc } from 'hono/client'

export default hc<api>('/api')
