import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.node': 'empty'
			}
		}
	},
	server: {
		https: {
			cert: mode === 'development' ? fs.readFileSync('./certs/site.marinadev.xyz.pem') : undefined,
			key:
				mode === 'development' ? fs.readFileSync('./certs/site.marinadev.xyz-key.pem') : undefined
		},
		hmr: {
			protocol: 'wss'
		}
	},
	resolve: {
		preserveSymlinks: true
	}
}))
