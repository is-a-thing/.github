import { z } from 'zod'

export const user = z.object({
	github_id: z.string(),
	domain_slot_override: z.number().optional(),
	name: z.string(),
})

export const session = z.object({
	id: z.string(),
	user_id: z.string(),
	expires_at: z.date(),
})

export const domain = z
	.object({
		name: z.string(),
		owner_id: z.string(),
	})
	.and(
		z.union([
			z.object({
				active: z.literal(false), // this will be automatically false if the count of domains the user has is more than or equal to their amount of domain slots
				// ^ needs to be accepted by staff
			}),
			z.object({
				active: z.literal(true),
				activated_at: z.date(),
				NS_records: z.string().array(), // this is the intended NS values of the domain
				last_push: z.date().optional(), // last time the value was pushed to DNS (only allowed to push every 15m)
				current_value_pushed: z.boolean(), // has the current value been pushed? (if the user edited NS during the timeout, the current value has not been pushed)
			}),
		]),
	)


export const full_user = z.object({
	user,
	domains: domain.array(),
	slots: z.number()
})