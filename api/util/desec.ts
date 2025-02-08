import { DESEC_TOKEN, DOMAIN } from '$util/env.ts'

import { None, type Option, Some } from '@oxi/option'
import { Err, Ok, type Result } from '@oxi/result'

async function fetchDesec(path: string, init?: RequestInit) {
	const request = new Request(new URL(path, 'https://desec.io'), {
		method: 'GET',
		...init,
		headers: {
			Authorization: `Token ${DESEC_TOKEN}`,
			...init?.headers,
		},
	})
	const response = await fetch(request)
	return response
}

const path_RRSet = `/api/v1/domains/${DOMAIN}/rrsets/`
const path_RRSetSubdomain = (subdomain: string) =>
	`${path_RRSet}${subdomain}/NS`

type RRSetResponse = {
	created: string
	domain: string
	subname: string
	name: string
	type: string
	records: string[]
	ttl: number
	touched: string
} | null

export async function fetchRRSet(
	subdomain: string,
): Promise<Option<RRSetResponse>> {
	const res = await fetchDesec(path_RRSetSubdomain(subdomain))
	if (!res.ok) return None
	const json = await res.json()
	return Some(json)
}

export async function setRRSet(
	subdomain: string,
	records: string[],
): Promise<Result<null, Response>> {
	const exists = (await fetchRRSet(subdomain)).isSome()
	const payload: Partial<RRSetResponse> = {
		subname: subdomain,
		type: 'NS',
		ttl: 3600,
		records,
	}
	const res = await fetchDesec(
		exists ? path_RRSetSubdomain(subdomain) : path_RRSet,
		{
			headers: {
				'Content-Type': 'application/json',
			},
			method: exists ? 'PUT' : 'POST',
			body: JSON.stringify(payload),
		},
	)

	if (res.ok) return Ok(null)
	return Err(res)
}
