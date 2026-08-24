import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.base.config'

// Packages are added here one by one as their tests move off Jest.
const migratedPackages = ['bernstein-polynomials', 'course-definition', 'exercise-bundling', 'exercise-definition', 'exercise-grading', 'input-exercises', 'input-interpretation', 'interpolation', 'js-utils', 'math-tools', 'physics-core', 'polynomials', 'serialization', 'settings', 'skill-definition', 'skill-setup', 'skill-tree']

export default mergeConfig(baseConfig, defineConfig({
	test: {
		include: migratedPackages.length
			? migratedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_migrated_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
}))
