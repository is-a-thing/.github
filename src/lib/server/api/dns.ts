import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

import { fetchRRSet, setRRSet } from '../apis/desec'

const postSubdomain = z.array(z.string())

export const dnsApi = new Hono()
	.get('/:subdomain', async (c) => {
		const res = await fetchRRSet(c.req.param().subdomain)
		if (res.isSome()) {
			return c.json(res.unwrap())
		}
		return c.json({}, { status: 400 })
	})
	.post('/:subdomain', zValidator('json', postSubdomain), async (c) => {
		const records = c.req.valid('json')
		const res = await setRRSet(c.req.param().subdomain, records)
		if (res.isOk()) {
			return c.text('', 204)
		}
		return c.text('', 204)
	})
