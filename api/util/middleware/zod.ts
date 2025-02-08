import type { StandaloneMiddlewareHandler } from '@bronti/wooter/types'
import { errorResponse, jsonResponse } from '@bronti/wooter/util'
import type { z, ZodSchema } from 'zod'
import { ZodError } from 'zod'

export type ZodJSON = <T extends ZodSchema>(schema: T) => Promise<z.infer<T>>

export const useZod: StandaloneMiddlewareHandler<{ json: ZodJSON }> = async (
	{ up, request, resp, err },
) => {
	let _json: unknown
	async function getJson() {
		if (_json) return _json
		try {
			return _json = await request.clone().json()
		} catch {
			resp(errorResponse(400, 'Invalid JSON'))
			throw ''
		}
	}

	const json: ZodJSON = async (schema) => {
		const json = await getJson()
		return schema.parseAsync(json)
	}
	try {
		await up({ json })
	} catch (e) {
		if (e instanceof ZodError) {
			return resp(jsonResponse(e.issues, {
				status: 400,
			}))
		}
		err(e)
	}
}
