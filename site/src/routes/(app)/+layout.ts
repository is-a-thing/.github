import posthog from 'posthog-js'

export async function load() {
	posthog.init('phc_Cr8bxKbYgknBDty7m7PG9IY3QtWLBOzZCphzKmWerPF', {
		api_host: 'https://us.i.posthog.com',
		capture_pageview: false,
		capture_pageleave: false,
		person_profiles: 'identified_only'
	})
}
