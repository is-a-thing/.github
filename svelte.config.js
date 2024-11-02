import adapter from 'sveltekit-adapter-deno';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		adapter: adapter({
			buildOptions: {
				loader: {
					// @deno/kv uses rust code built as .node files to provide a couple functions
					// required for Deno KV when using node, but when @deno/kv is in a deno environment
					// it realizes that it doesn't need to fill in it's functions and just uses Deno.openKv
					'.node': 'empty'
				}
			}
		})
	},

	extensions: ['.svelte', '.svx']
};

export default config;
