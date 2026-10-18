import { afterEach, describe, expect, it } from 'vitest'

import { activateLinguiLanguage, linguiI18n, loadLinguiCatalog } from './index.ts'

afterEach(() => activateLinguiLanguage('en'))

describe('Lingui trial catalogs', () => {
	it('loads and activates translated application catalogs', async () => {
		linguiI18n.load('nl', await loadLinguiCatalog('nl', 'pages/test'))
		activateLinguiLanguage('nl')
		expect(linguiI18n._('i18nTrial.plain')).toBe('Deze tekst is vertaald met Lingui.')

		linguiI18n.load('de', await loadLinguiCatalog('de', 'pages/test'))
		activateLinguiLanguage('de')
		expect(linguiI18n._('i18nTrial.plain')).toBe('Dieser Text wurde mit Lingui übersetzt.')
	})

	it('discovers separate page catalogs', async () => {
		linguiI18n.load('nl', await loadLinguiCatalog('nl', 'pages/home'))
		linguiI18n.load('nl', await loadLinguiCatalog('nl', 'pages/settings'))
		activateLinguiLanguage('nl')
		expect(linguiI18n._('home.websiteNameAddendum')).toBe('Oefenopgaven op maat')
		expect(linguiI18n._('settings.language.title')).toBe('Taalinstellingen')
	})

	it('rejects unsupported languages', () => {
		expect(() => activateLinguiLanguage('fr')).toThrow('Unsupported language: fr')
	})
})
