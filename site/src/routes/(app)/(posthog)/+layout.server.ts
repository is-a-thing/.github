import { env } from "$env/dynamic/private"

export async function load() {
    return {
        commitID: env.DENO_DEPLOYMENT_ID ?? 'dev'
    }
}