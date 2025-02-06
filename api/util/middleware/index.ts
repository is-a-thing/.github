import { Wooter } from '@bronti/wooter'
import { useZod } from '$util/middleware/zod.ts'
import { useCookies } from '$util/middleware/cookies.ts'
import { useAuth } from '$util/middleware/auth.ts'
import { MAINPAGE } from '$util/env.ts'

function addCors(response: Response) {
    response.headers.set("Access-Control-Allow-Origin", MAINPAGE)
    response.headers.set("Access-Control-Allow-Credentials", "true")
}

export function initWooter() {
    return new Wooter().useMethods().use(async ({ up }) => {
        addCors(await up())
    }).use(useCookies).use(useAuth).use(useZod).notFound(({ resp, url }) => {
        const response = new Response(`Not Found ${url.pathname}`, { status: 404 })
        addCors(response)
        resp(response)
    })
}