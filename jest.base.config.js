const { createDefaultPreset } = require('ts-jest')

function createBaseConfig(tsconfig = '<rootDir>/tsconfig.test.jest.json') {
	return {
		testEnvironment: 'node',
		...createDefaultPreset({ tsconfig }),
	}
}

module.exports = { createBaseConfig }
