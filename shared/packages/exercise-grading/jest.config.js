const { createBaseConfig } = require('../../jest.base.config')

module.exports = {
	...createBaseConfig('<rootDir>/../../tsconfig.base.json'),
	rootDir: '.',
	testMatch: ['<rootDir>/src/**/*.test.ts'],
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	moduleNameMapper: {
		'^@step-wise/([^/]+)$': '<rootDir>/../$1/src',
		'^@step-wise/([^/]+)/(.*)$': '<rootDir>/../$1/src/$2',
	},
}