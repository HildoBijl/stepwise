import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './vitest.base.config.ts'

// Keep this list aligned with the packages that contain unit tests.
const testedPackages = ['bernstein-polynomials', 'cas', 'course-definition', 'demo-exercises', 'engineering-mechanics', 'exercise-bundling', 'exercise-definition', 'exercise-grading', 'exercise-selection', 'exercises', 'geometry', 'interpolation', 'input-exercises', 'input-interpretation', 'js-utils', 'math-input-value', 'math-tools', 'mathematics-exercises', 'mechanics-exercises', 'physics-core', 'physics-data', 'physics-exercises', 'polynomials', 'serialization', 'settings', 'skill-definition', 'skill-setup', 'skill-tracking', 'skill-tree']

export default mergeConfig(baseConfig, defineConfig({
	test: {
		include: testedPackages.length
			? testedPackages.map(packageName => `packages/${packageName}/src/**/*.test.ts`)
			: ['**/__no_package_tests__/**/*.test.ts'],
		passWithNoTests: true,
	},
}))
