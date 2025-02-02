import { Hono } from 'hono'
import type { HonoOptions } from 'hono/hono-base'
import type { BlankEnv } from 'hono/types'

export function createHono(options?: HonoOptions<BlankEnv> | undefined) {
	return new Hono<{ Bindings: { locals: App.Locals } }>(options)
}
