import type { z } from "zod";
import { user } from "$lib/shared/schema"
import { PUBLIC_API } from "$env/static/public";

export async function load({ fetch }) {
	const userR = await fetch(`${PUBLIC_API}/me`)
	const usr = (userR.ok ? await userR.json() : null) as z.infer<typeof user> | null
	return {
		user: usr
	}
}


export const csr = true;
export const ssr = false;