import { Hono } from 'hono'

import { dnsApi } from './dns'

const api = new Hono().route('/dns', dnsApi)

const hono = new Hono().route('/api', api)

export default hono
export type api = typeof api
