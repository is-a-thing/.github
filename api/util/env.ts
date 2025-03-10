import '@std/dotenv/load'
const {
	ID_GITHUB,
	SECRET_GITHUB,
	DESEC_TOKEN,
	DEV,
	DOMAIN,
	MAINPAGE,
	BANNED_DOMAINS,
	GITHUB_API,
	GITHUB_AUTHORIZATION_DOMAIN,
} = Deno.env.toObject()
const DOMAIN_LIMIT = 6
export {
	BANNED_DOMAINS,
	DESEC_TOKEN,
	DEV,
	DOMAIN,
	DOMAIN_LIMIT,
	GITHUB_API,
	GITHUB_AUTHORIZATION_DOMAIN,
	ID_GITHUB,
	MAINPAGE,
	SECRET_GITHUB,
}
