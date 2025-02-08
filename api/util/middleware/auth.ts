import { StandaloneMiddlewareHandler } from '@bronti/wooter/types'
import {
	createSessionCookie,
	deleteSessionCookie,
	validateSessionToken,
} from '$auth/index.ts'
import { AuthPair } from '$auth/index.ts'
import { Cookies } from '$util/middleware/cookies.ts'
import { None, Option } from '@oxi/option'
import { errorResponse } from '@bronti/wooter/util'

export const useAuth: StandaloneMiddlewareHandler<
	{ auth: Option<AuthPair>; ensureAuth: () => AuthPair },
	{ cookies: Cookies }
> = async ({ data: { cookies }, up, resp, request }) => {
	const token = cookies.get('session') ?? null
	let auth: Option<AuthPair> = None
	if (token) {
		const pairOption = await validateSessionToken(token)

		if (pairOption.isSome()) {
			// Token exists and is valid; update cookie and set auth
			createSessionCookie(token, cookies)
			auth = pairOption
		} else {
			// Token exists but is not valid; remove it
			deleteSessionCookie(cookies)
		}
	}

	await up({
		auth,
		ensureAuth: () => {
			if (auth.isNone()) {
				throw resp(errorResponse(401, 'Unauthorized'))
			}
			return auth.unwrap()
		},
	})
}
