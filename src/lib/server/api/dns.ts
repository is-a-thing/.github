import { normalizeDomainName } from '$lib/utils'

import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { fetchRRSet, setRRSet } from '../apis/desec'
import { db } from '../db'
import { createHono } from './hono'

const postSubdomain = z.array(z.string())

export const dnsApi = createHono()
	.get('/:subdomain', async (c) => {
		const { user } = c.env.locals.auth
		const { subdomain } = c.req.param()
		if (subdomain !== normalizeDomainName(subdomain)) return c.body(null, 401)
		if (!user) return c.body(null, 401)
		const subdomainObject = await db.domain.find(subdomain)
		if (!subdomainObject || subdomainObject.value.ownerId !== user.githubId) {
			return c.text('', 404)
		}
		const res = await fetchRRSet(subdomain)
		if (res.isSome()) {
			return c.json(res.unwrap())
		}
		return c.text('', 400)
	})
	.post('/:subdomain', zValidator('json', postSubdomain), async (c) => {
		const { user } = c.env.locals.auth
		const { subdomain } = c.req.param()
		if (subdomain !== normalizeDomainName(subdomain)) return c.body(null, 401)
		if (!user) return c.body(null, 401)
		const subdomainObject = await db.domain.find(subdomain)
		if (!subdomainObject || subdomainObject.value.ownerId !== user.githubId) {
			return c.notFound()
		}
		const records = c.req.valid('json')
		const res = await setRRSet(subdomain, records)
		if (res.isOk()) {
			return c.text('', 204)
		}
		return c.text('', 400)
	})
