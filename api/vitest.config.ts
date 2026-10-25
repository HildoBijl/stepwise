import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		env: { POSTGRES_DB: 'testing' },
		fileParallelism: false,
		fsModuleCachePath: join(tmpdir(), 'stepwise-api-vitest-cache'),
		globalSetup: './tests/globalSetup.ts',
		include: ['tests/**/*.test.ts'],
		maxWorkers: 1,
		minWorkers: 1,
	},
})
