import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@step-wise\/([^/]+)(\/.*)?$/,
				replacement: fileURLToPath(new URL('./packages/$1/src$2', import.meta.url)),
			},
		],
	},
	test: {
		environment: 'node',
	},
})
