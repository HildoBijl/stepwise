import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.base.config'

// Packages are added here one by one as their tests move off Jest.
const migratedPackages = ['bernstein-polynomials', 'course-definition', 'engineering-mechanics', 'exercise-bundling', 'exercise-definition', 'exercise-grading', 'exercise-selection', 'geometry', 'interpolation', 'input-exercises', 'input-interpretation', 'js-utils', 'math-tools', 'physics-core', 'physics-data', 'polynomials', 'serialization', 'settings', 'skill-definition', 'skill-setup', 'skill-tracking', 'skill-tree']

export default mergeConfig(baseConfig, defineConfig({
	test: {
		include: migratedPackages.length
			? migratedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_migrated_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
}))
