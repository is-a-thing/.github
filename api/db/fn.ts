import { db } from '$db/index.ts'
import { domain } from "$shared/schema.ts"
import { DOMAIN_LIMIT } from '$util/env.ts'

export function domainCount(user_id: string) {
    return db.domain.countBySecondaryIndex('owner_id', user_id)
}

export async function getDomainsByUser(user_id: string): Promise<Zod.infer<typeof domain>[]> {
    const { result } = await db.domain.findBySecondaryIndex('owner_id', user_id)
    return result.map(domain => {
        return domain.value
    })
}

export function domainSlots(override: number | undefined) {
    return override ?? DOMAIN_LIMIT
}