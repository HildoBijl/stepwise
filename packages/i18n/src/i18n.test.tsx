// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react'
import { Trans } from '@lingui/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider, setupI18n, TranslationCatalog } from './index.ts'

describe('I18nProvider', () => {
	it('renders and updates translated messages', () => {
		const i18n = setupI18n({
			locale: 'en',
			messages: {
				en: { greeting: 'Hello' },
				nl: { greeting: 'Hallo' },
			},
		})
		const view = render(<I18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></I18nProvider>)
		expect(screen.getByText('Hello')).toBeTruthy()

		i18n.activate('nl')
		view.rerender(<I18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></I18nProvider>)
		expect(screen.getByText('Hallo')).toBeTruthy()
	})

	it('loads, caches, and switches lazy catalogs', async () => {
		const i18n = setupI18n({ locale: 'en', messages: { en: {}, nl: {} } })
		const loadCatalog = vi.fn(async (locale: string) => ({ greeting: locale === 'nl' ? 'Hallo' : 'Hello' }))
		render(<I18nProvider i18n={i18n} loadCatalog={loadCatalog}>
			<TranslationCatalog path="example" fallback="Loading">
				<Trans id="greeting" />
			</TranslationCatalog>
			<TranslationCatalog path="example"><span /></TranslationCatalog>
		</I18nProvider>)

		expect(screen.getByText('Loading')).toBeTruthy()
		expect(await screen.findByText('Hello')).toBeTruthy()
		expect(loadCatalog).toHaveBeenCalledTimes(1)

		act(() => i18n.activate('nl'))
		expect(screen.getByText('Loading')).toBeTruthy()
		expect(await screen.findByText('Hallo')).toBeTruthy()
		expect(loadCatalog).toHaveBeenCalledTimes(2)
	})
})
