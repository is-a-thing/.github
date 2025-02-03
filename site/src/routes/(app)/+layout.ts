import type { z } from "zod";
import { user } from "$lib/shared/schema"
import { PUBLIC_API } from "$env/static/public";
import { fetchAPI } from "$lib/client/api/index.js";

export async function load({ fetch }) {
	const userR = await fetchAPI(`${PUBLIC_API}/me`, {}, fetch)
	const usr = (userR.ok ? await userR.json() : null) as z.infer<typeof user> | null
	return {
		user: usr
	}
}

export const csr = true;
export const ssr = false;