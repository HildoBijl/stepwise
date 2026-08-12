const { createDefaultPreset } = require('ts-jest')

function createBaseConfig(tsconfig) {
	return {
		testEnvironment: 'node',
		...createDefaultPreset({ tsconfig }),
	}
}

module.exports = { createBaseConfig }