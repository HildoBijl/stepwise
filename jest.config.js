const { createBaseConfig } = require('./jest.base.config')

module.exports = {
	...createBaseConfig(),
	testMatch: ['<rootDir>/packages/**/*.test.ts'],
	testPathIgnorePatterns: [
		'<rootDir>/packages/bernstein-polynomials/',
		'<rootDir>/packages/polynomials/',
		'<rootDir>/packages/settings/',
		'<rootDir>/packages/skill-setup/',
	],
	moduleNameMapper: {
		'^@step-wise/([^/]+)$': '<rootDir>/packages/$1/src',
		'^@step-wise/([^/]+)/(.*)$': '<rootDir>/packages/$1/src/$2',
	},
}
