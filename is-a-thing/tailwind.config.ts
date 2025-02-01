import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts,svx}'],
	daisyui: {
		themes: [
			{
				isathing: {
					primary: '#51aafa',

					secondary: '#2a7faf',

					accent: '#ffffff',

					neutral: '#ffffff',

					'base-100': '#011525',
					'base-content': '#51aafa',

					info: '#0000ff',

					success: '#00ff00',

					warning: '#ffff00',

					error: '#ff0000'
				}
			}
		]
	},

	theme: {
		extend: {
			fontFamily: {
				jersey15: ['"Jersey 15"', ...fontFamily.mono],
				jersey10: ['"Jersey 10"', ...fontFamily.mono],
				sans: ['"Jersey 10"', ...fontFamily.sans]
			}
		}
	},
	plugins: [daisyui, typography()]
} satisfies Config

export default config
