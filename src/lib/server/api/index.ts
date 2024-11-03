import { dnsApi } from './dns'
import { createHono } from './hono'

const api = createHono().route('/dns', dnsApi)

const hono = createHono().route('/api', api)

export default hono
export type api = typeof api
