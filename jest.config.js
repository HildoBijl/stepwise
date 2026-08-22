const { createBaseConfig } = require('./jest.base.config')

module.exports = {
	...createBaseConfig(),
	testMatch: ['<rootDir>/packages/**/*.test.ts'],
	testPathIgnorePatterns: [
		'<rootDir>/packages/bernstein-polynomials/',
		'<rootDir>/packages/course-definition/',
		'<rootDir>/packages/exercise-bundling/',
		'<rootDir>/packages/exercise-definition/',
		'<rootDir>/packages/input-exercises/',
		'<rootDir>/packages/js-utils/',
		'<rootDir>/packages/math-tools/',
		'<rootDir>/packages/polynomials/',
		'<rootDir>/packages/settings/',
		'<rootDir>/packages/skill-definition/',
		'<rootDir>/packages/skill-setup/',
		'<rootDir>/packages/skill-tree/',
	],
	moduleNameMapper: {
		'^@step-wise/([^/]+)$': '<rootDir>/packages/$1/src',
		'^@step-wise/([^/]+)/(.*)$': '<rootDir>/packages/$1/src/$2',
	},
}
