import { db } from '$db/index.ts'

export function domainCount(user_id: string) {
    return db.domain.countBySecondaryIndex('owner_id', user_id)
}