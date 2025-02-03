import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import fs from "node:fs"

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.node': 'empty'
			}
		}
	},
	server: {
		https: {
			cert: fs.readFileSync('./certs/site.marinadev.xyz.pem'),
			key: fs.readFileSync("./certs/site.marinadev.xyz-key.pem"),
		},
		hmr: {
			protocol: "wss",
		},
	},
	resolve: {
		preserveSymlinks: true
	},
})
