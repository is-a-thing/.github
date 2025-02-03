import { error } from "@sveltejs/kit"

export async function load({ parent }) {
    const { user } = await parent()
    if(!user) error(401, "Unauthorized")
    return {
        user
    }
}

