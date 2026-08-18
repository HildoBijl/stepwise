import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// Packages are added here one by one as their tests move off Jest.
const migratedPackages = ['bernstein-polynomials', 'polynomials', 'settings']

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
		globals: true,
		include: migratedPackages.length
			? migratedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_migrated_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
})
