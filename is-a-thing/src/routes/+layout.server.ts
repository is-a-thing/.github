export async function load({ locals }) {
	return {
		user: locals.auth.user
	}
}
