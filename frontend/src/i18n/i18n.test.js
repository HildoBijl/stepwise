import { deepEquals } from 'step-wise/util'
import { i18nUpdateLogPath } from '@step-wise/settings'

describe('Translations', () => {
	it('have all been implemented (translation update log is empty)', async () => {
		try {
			const pathToPublicFolder = `../../public/`
			const logFile = await import(`${pathToPublicFolder}${i18nUpdateLogPath}`)

			// For some reason a default parameter is added on the import. Allow it too.
			expect(deepEquals(logFile, {}) || deepEquals(logFile, { default: {} })).toBe(true)
		} catch (error) {
			expect(error instanceof SyntaxError).toBe(true) // A syntax error is fine: it most likely means the entire log contents have been removed.
		}
	})
})
