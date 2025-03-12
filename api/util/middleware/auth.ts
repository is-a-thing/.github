import { StandaloneMiddlewareHandler } from '@bronti/wooter/types'
import { validateSessionToken } from '$auth/index.ts'
import { AuthPair } from '$auth/index.ts'
import { None, Option } from '@oxi/option'
import { errorResponse } from '@bronti/wooter/util'

export const useAuth: StandaloneMiddlewareHandler<
	{
		auth: Option<AuthPair>
		ensureAuth: () => AuthPair
		deleteSession: () => void
	}
> = async ({ up, resp, request }) => {
	const token =
		request.headers.get('Authorization')?.split(' ') as [string, string] ??
			null
	let auth: Option<AuthPair> = None
	let newToken: string = ''
	if (token && token[0].toLowerCase() === 'bearer') {
		const pairOption = await validateSessionToken(token[1])

		if (pairOption.isSome()) {
			// Token exists and is valid; update token and set auth
			newToken = token[1]
			auth = pairOption
		}
	}

	const response = await up({
		auth,
		ensureAuth: () => {
			if (auth.isNone()) {
				throw resp(errorResponse(401, 'Unauthorized'))
			}
			return auth.unwrap()
		},
		deleteSession: () => {
			newToken = ''
		},
	})

	response.headers.set('Authorization', newToken)
}
