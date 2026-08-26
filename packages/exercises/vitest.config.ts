import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from '../../vitest.base.config'

export default mergeConfig(baseConfig, defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
	},
}))
