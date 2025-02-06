import { c } from "@bronti/wooter"
import { initWooter } from '$util/middleware/index.ts'

import { authNamespace } from './routers/auth.ts'
import { mePreRouter, meRouter } from './routers/me.ts'
import { domainsRouter } from './routers/domains.ts'
import { redirectResponse } from '@bronti/wooter/util'
import { MAINPAGE } from '$util/env.ts'


const app = initWooter()
    .namespace(c.chemin('auth'), wooter => wooter.useMethods(), authNamespace)
    .namespace(c.chemin('me'), wooter => mePreRouter(wooter), meRouter)
    .namespace(c.chemin('domains'), wooter => wooter.useMethods(), domainsRouter)
    .GET(c.chemin(), async ({ resp }) => {
        resp(redirectResponse(MAINPAGE))
    })

export default { fetch: app.fetch };