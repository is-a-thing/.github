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

const date = z.preprocess(arg => typeof arg == 'string' ? new Date(arg) : arg instanceof Date ? arg : undefined, z.date())

export const domain = z
	.object({
		name: z.string(),
		owner_id: z.string(),
		activated_at: date,
		NS_records: z.string().array(), // this is the intended NS values of the domain
		last_push: date.optional(), // last time the value was pushed to DNS (only allowed to push every 15m)
		current_value_pushed: z.boolean(), // has the current value been pushed? (if the user edited NS during the timeout, the current value has not been pushed)
	})


export const full_user = z.object({
	user,
	domains: domain.array(),
	slots: z.number()
})

export const domainSettings = z.object({
	NS_records: z.string().min(2).toLowerCase().regex(/^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})\.$/, { message: "must be correct and end with (.)" }).array(),
})