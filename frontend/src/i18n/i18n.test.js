import { deepEqual } from '@step-wise/js-utils'

import updateLogContents from '../../public/locales/updateLog.json?raw'

describe('Translations', () => {
	it('have all been implemented (translation update log is empty)', async () => {
		try {
			const logFile = JSON.parse(updateLogContents)
			expect(deepEqual(logFile, {})).toBe(true)
		} catch (error) {
			expect(error instanceof SyntaxError).toBe(true) // A syntax error is fine: it most likely means the entire log contents have been removed.
		}
	})
})
