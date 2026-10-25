import { describe, expect, it } from 'vitest'

import { findCatalogUnit } from '@step-wise/i18n'

import { loadCatalog } from './index.ts'

describe('XLIFF catalogs', () => {
	it('loads translated application catalogs', async () => {
		const dutch = await loadCatalog('nl', 'pages/home')
		expect(findCatalogUnit(dutch, [], 'head')?.target?.message).toEqual([
			{ type: 'text', value: 'Hoe werkt het?' },
		])

		const german = await loadCatalog('de', 'pages/home')
		expect(findCatalogUnit(german, [], 'head')?.target?.message).toEqual([
			{ type: 'text', value: 'Wie funktioniert es?' },
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
		await expect(loadCatalog('fr', 'pages/home')).rejects.toThrow('Unsupported language: fr')
	})
})
