import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts,svx}'],
	theme: {
		extend: {
			fontFamily: {
				jersey15: ['"Jersey 15"', ...fontFamily.mono],
				jersey10: ['"Jersey 10"', ...fontFamily.mono],
				sans: ['"Jersey 10"', ...fontFamily.sans]
			}
		}
	},
	plugins: [daisyui]
} satisfies Config

export default config
