import { hc } from 'hono/client'

import type { API } from './server'

export default hc<API>('/api')
