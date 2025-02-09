import { c } from '@bronti/wooter'
import { initWooter } from '$util/middleware/index.ts'

import { authNamespace } from './routers/auth.ts'
import { mePreRouter, meRouter } from './routers/me.ts'
import { domainsRouter } from './routers/domains.ts'
import { redirectResponse } from '@bronti/wooter/util'
import { MAINPAGE } from '$util/env.ts'
import posthog from '$util/posthog.ts'

const app = initWooter()
	.namespace(c.chemin('auth'), (wooter) => wooter.useMethods(), authNamespace)
	// @ts-expect-error: Need to fix this in wooter, but it's not a big deal at the moment
	.namespace(c.chemin('me'), (wooter) => {
		return mePreRouter(wooter.useMethods())
	}, meRouter)
	.namespace(
		c.chemin('domains'),
		(wooter) => wooter.useMethods(),
		domainsRouter,
	)
	.GET(c.chemin(), ({ resp }) => {
		resp(redirectResponse(MAINPAGE))
	})

export default { fetch: app.fetch }


globalThis.addEventListener("unload", async () => {
	await posthog.shutdown()
});