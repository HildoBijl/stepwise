import { defineConfig } from 'vitest/config'

// Packages are added here one by one as their tests move off Jest.
const migratedPackages = ['settings']

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: migratedPackages.length
			? migratedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_migrated_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
})
