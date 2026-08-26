import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.base.config'

// Packages are added here one by one as their tests move off Jest.
const migratedPackages = ['bernstein-polynomials', 'course-definition', 'demo-exercises', 'engineering-mechanics', 'exercise-bundling', 'exercise-definition', 'exercise-grading', 'exercise-selection', 'exercises', 'geometry', 'interpolation', 'input-exercises', 'input-interpretation', 'js-utils', 'math-input-value', 'math-tools', 'mathematics-exercises', 'mechanics-exercises', 'physics-core', 'physics-data', 'physics-exercises', 'polynomials', 'serialization', 'settings', 'skill-definition', 'skill-setup', 'skill-tracking', 'skill-tree']

export default mergeConfig(baseConfig, defineConfig({
	test: {
		include: migratedPackages.length
			? migratedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_migrated_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
}))
