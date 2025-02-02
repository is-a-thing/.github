import { z } from 'zod'

export const user = z.object({
	githubId: z.string(),
	domainSlots: z.number(),
	name: z.string(),
})

export const session = z.object({
	id: z.string(),
	userId: z.string(),
	expiresAt: z.date(),
})

export const domain = z
	.object({
		name: z.string(),
		ownerId: z.string(),
	})
	.and(
		z.union([
			z.object({
				active: z.literal(false), // this will be automatically false if the count of domains the user has is more than or equal to their amount of domain slots
				// ^ needs to be accepted by staff
			}),
			z.object({
				active: z.literal(true),
				activatedAt: z.date(),
				NSRecords: z.string().array(), // this is the intended NS values of the domain
				lastNSPush: z.date(), // last time the value was pushed to Vercel (only allowed to push every 15m)
				currentValuePushed: z.boolean(), // has the current value been pushed? (if the user edited NS during the timeout, the current value has not been pushed)
			}),
		]),
	)
