import {
	parse,
	serialize,
	type SerializeOptions,
} from "cookie"
import { MiddlewareHandler, Params, Data } from "@bronti/wooter/types"


export type Cookies = {
	get(name: string): string
	getAll(): Record<string, string | undefined>
	delete(name: string, options?: Partial<SerializeOptions>): void
	set(name: string, value: string, options?: Partial<SerializeOptions>): void
}

export const useCookies: MiddlewareHandler<Params, Data, { cookies: Cookies }> = async ({ request, resp, up }) => {
    const cookieHeader = request.headers.get("cookie") || ""
    const parsedCookies = parse(cookieHeader)
    const cookieMap: Record<
        string,
        { value: string; opts?: Partial<SerializeOptions> }
    > = {}

    const cookies: Cookies = {
        get: (name) => cookieMap[name]?.value ?? parsedCookies[name],
        getAll: () =>
            Object.fromEntries(
                Object.entries(parsedCookies).concat(
                    Object.entries(cookieMap).map(([name, { value }]) => {
                        return [name, value]
                    }),
                ),
            ),
        delete: (name, options) => {
            cookieMap[name] = { value: "", opts: { ...options, maxAge: 0 } }
        },
        set: (
            name,
            value,
            options,
        ) => {
            cookieMap[name] = { value, opts: options }
        },
    }

    const response = await up({ cookies })

    // Get all cookies that were set during request handling
    const newCookies = Object.entries(cookieMap)
        .map(([name, cookie]) =>
            serialize(name, cookie.value || "", cookie.opts)
        )

    // Add cookies to response headers
    if (newCookies.length > 0) {
        const existingHeaders = new Headers(response.headers)
        newCookies.forEach((cookie) => {
            existingHeaders.append("Set-Cookie", cookie)
        })

        return resp(
            new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: existingHeaders,
            }),
        )
    }

    resp(response)
}