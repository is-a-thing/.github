import { DOMAIN } from '$util/env.ts'

export async function checkDNS(subdomain: string) {
    return await Deno.resolveDns(`${subdomain}.${DOMAIN}`, 'NS')
}