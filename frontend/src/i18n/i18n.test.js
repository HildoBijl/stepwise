import { deepEquals } from '@step-wise/utils'
import { i18nUpdateLogPath } from '@step-wise/settings'

describe('Translations', () => {
	it('have all been implemented (translation update log is empty)', async () => {
		try {
			const pathToPublicFolder = `../../public/`
			const logFile = await import(`${pathToPublicFolder}${i18nUpdateLogPath}`)

			// Even when the JSON file is empty, its import can be a variety of objects, depending on the Node version. Let's check if any of the empty objects matches.
			const options = [{}, Object.create(null), Object.create(null)]
			options[2].default = {}
			expect(options.some(option => deepEquals(logFile, option))).toBe(true)
		} catch (error) {
			expect(error instanceof SyntaxError).toBe(true) // A syntax error is fine: it most likely means the entire log contents have been removed.
		}
	})
})
