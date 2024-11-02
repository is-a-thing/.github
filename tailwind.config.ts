import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts,svx}'],
	theme: {
		extend: {}
	},
	plugins: [daisyui]
} satisfies Config;

export default config;
