import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		fsModuleCachePath: join(tmpdir(), 'stepwise-api-vitest-cache'),
		include: ['tests/unit/**/*.test.ts'],
	},
})
