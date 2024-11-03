import { fetchRRSet, setRRSet } from '$lib/server/apis/desec';
import { json, text } from "@sveltejs/kit"

const ENABLED = false;

export async function GET({ params: { subdomain } }) {
    if(!ENABLED) return
    const res = await fetchRRSet(subdomain)
    if(res.isSome()) {
        return json(res.unwrap());
    }
    return json({}, { status: 404 })
}

export async function POST({ params: { subdomain }, request }) {
    if(!ENABLED) return
    const body = await request.json()
    const res = await setRRSet(subdomain, body)
    if(res.isOk()) {
        return json({}, { status: 200 })
    }
    return text(res.unwrapErr(), { status: 400 })
}