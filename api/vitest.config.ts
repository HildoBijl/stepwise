import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		env: { POSTGRES_DB: 'testing' },
		fileParallelism: false,
		globalSetup: './tests/globalSetup.ts',
		globals: true,
		include: ['tests/**/*.test.ts'],
		maxWorkers: 1,
		minWorkers: 1,
	},
})
