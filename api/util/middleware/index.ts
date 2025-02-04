import { Wooter } from '@bronti/wooter'
import { useZod } from '$util/middleware/zod.ts'
import { useCookies } from '$util/middleware/cookies.ts'
import { useAuth } from '$util/middleware/auth.ts'
import { MAINPAGE } from '$util/env.ts'

function addCors(response: Response) {
    response.headers.set("Access-Control-Allow-Origin", MAINPAGE)
    response.headers.set("Access-Control-Allow-Credentials", "true")
}

export function wooter() {
    return new Wooter().use(async ({ up }) => {
        const response = await up();
        addCors(response)
    }).use(useZod).use(useCookies).use(useAuth).notFound(async ({ resp, url }) => {
        const response = new Response(`Not Found ${url.pathname}`, { status: 404 })
        addCors(response)
        resp(response)
    }).useMethods()
}