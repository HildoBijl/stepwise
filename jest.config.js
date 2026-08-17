const { createBaseConfig } = require('./jest.base.config')

module.exports = {
	...createBaseConfig(),
	testMatch: ['<rootDir>/packages/**/*.test.ts'],
	moduleNameMapper: {
		'^@step-wise/([^/]+)$': '<rootDir>/packages/$1/src',
		'^@step-wise/([^/]+)/(.*)$': '<rootDir>/packages/$1/src/$2',
	},
}
