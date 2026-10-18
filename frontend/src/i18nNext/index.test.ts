import { afterEach, describe, expect, it } from 'vitest'

import { activateLinguiLanguage, linguiI18n } from './index.ts'

afterEach(() => activateLinguiLanguage('en'))

describe('Lingui trial catalogs', () => {
	it('activates translated application catalogs', () => {
		activateLinguiLanguage('nl')
		expect(linguiI18n._('i18nTrial.plain')).toBe('Deze tekst is vertaald met Lingui.')

		activateLinguiLanguage('de')
		expect(linguiI18n._('i18nTrial.plain')).toBe('Dieser Text wurde mit Lingui übersetzt.')
	})

	it('rejects unsupported languages', () => {
		expect(() => activateLinguiLanguage('fr')).toThrow('Unsupported language: fr')
	})
})
