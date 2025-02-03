import { Wooter } from '@bronti/wooter'
import { useZod } from '$util/middleware/zod.ts'
import { useCookies } from '$util/middleware/cookies.ts'
import { useAuth } from '$util/middleware/auth.ts'
import { DEV, MAINPAGE } from '$util/env.ts'

export function wooter() {
    return new Wooter().use(async ({ up }) => {
        // CORS
        const request = await up();
        request.headers.set("Access-Control-Allow-Origin", DEV === 'true'?`http://${MAINPAGE}`:`https://${MAINPAGE}`)
        request.headers.set("Access-Control-Allow-Credentials", "true")
    }).use(useZod).use(useCookies).use(useAuth).useMethods()
}