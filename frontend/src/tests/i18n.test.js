import { deepEquals } from 'step-wise/util'

describe('Translations', () => {
	it('have all been implemented (translation update log is empty)', async () => {
		try {
			const logFile = await import('../../public/locales/updateLog.json')
			console.log(deepEquals(logFile, {}) || deepEquals(logFile, { default: {} })) // For some reason a default parameter is added on the import. Allow it too.
			expect(deepEquals(logFile, {}) || deepEquals(logFile, { default: {} })).toBe(true)
		} catch (error) {
			expect(error instanceof SyntaxError).toBe(true) // A syntax error is fine: it most likely means the entire log contents have been removed.
		}
	})
})
