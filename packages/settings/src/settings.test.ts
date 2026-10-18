import { describe, expect, it } from 'vitest'

import { defaultDecimalSeparator, i18nLoadPath } from './index.ts'

describe('language settings', () => {
	it('builds translation paths for top-level and nested resources', () => {
		expect(i18nLoadPath('en', 'main')).toBe('/locales/en/main.json')
		expect(i18nLoadPath('de', 'pages/settings')).toBe('/locales/de/pages/settings.json')
	})
})

describe('number settings', () => {
	it('uses a comma as the site-wide decimal separator', () => {
		expect(defaultDecimalSeparator).toBe(',')
	})
})
