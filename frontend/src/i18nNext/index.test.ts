import { describe, expect, it } from 'vitest'

import { findCatalogUnit } from '@step-wise/i18n'

import { loadCatalog } from './index.ts'

describe('XLIFF catalogs', () => {
	it('loads translated application catalogs', async () => {
		const dutch = await loadCatalog('nl', 'pages/test')
		expect(findCatalogUnit(dutch, ['i18nTrial'], 'plain')?.target?.message).toEqual([
			{ type: 'text', value: 'Deze tekst is vertaald met XLIFF.' },
		])

		const german = await loadCatalog('de', 'pages/test')
		expect(findCatalogUnit(german, ['i18nTrial'], 'plain')?.target?.message).toEqual([
			{ type: 'text', value: 'Dieser Text wurde mit XLIFF übersetzt.' },
		])
	})

	it('discovers separate page catalogs', async () => {
		const home = await loadCatalog('nl', 'pages/home')
		const settings = await loadCatalog('nl', 'pages/settings')
		expect(findCatalogUnit(home, [], 'websiteNameAddendum')?.target?.message).toEqual([
			{ type: 'text', value: 'Oefenopgaven op maat' },
		])
		expect(findCatalogUnit(settings, ['language'], 'title')?.target?.message).toEqual([
			{ type: 'text', value: 'Taalinstellingen' },
		])
	})

	it('rejects unsupported languages', async () => {
		await expect(loadCatalog('fr', 'pages/test')).rejects.toThrow('Unsupported language: fr')
	})
})
