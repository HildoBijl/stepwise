import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: [
			{
				find: '#generationTools',
				replacement: fileURLToPath(new URL('./packages/mathematics-exercises/src/generationTools.ts', import.meta.url)),
			},
			{
				find: '#tools',
				replacement: fileURLToPath(new URL('./packages/mechanics-exercises/src/tools/index.ts', import.meta.url)),
			},
			{
				find: /^@step-wise\/([^/]+)(\/.*)?$/,
				replacement: fileURLToPath(new URL('./packages/$1/src$2', import.meta.url)),
			},
		],
	},
	test: {
		environment: 'node',
		globals: true,
	},
})
