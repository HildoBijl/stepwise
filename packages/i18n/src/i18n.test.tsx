// @vitest-environment jsdom

import { act, render, screen } from '@testing-library/react'
import { Trans } from '@lingui/react'
import { describe, expect, it, vi } from 'vitest'

import { type I18nRuntime, I18nProvider, LinguiI18nProvider, setupI18n, TranslationCatalog, useI18n } from './index.ts'

describe('LinguiI18nProvider', () => {
	it('renders and updates translated messages', () => {
		const i18n = setupI18n({
			locale: 'en',
			messages: {
				en: { greeting: 'Hello' },
				nl: { greeting: 'Hallo' },
			},
		})
		const view = render(<LinguiI18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></LinguiI18nProvider>)
		expect(screen.getByText('Hello')).toBeTruthy()

		i18n.activate('nl')
		view.rerender(<LinguiI18nProvider i18n={i18n}><Trans id="greeting" message="Hello" /></LinguiI18nProvider>)
		expect(screen.getByText('Hallo')).toBeTruthy()
	})

	it('loads, caches, and switches lazy catalogs', async () => {
		const i18n = setupI18n({ locale: 'en', messages: { en: {}, nl: {} } })
		const loadCatalog = vi.fn(async (locale: string) => ({ greeting: locale === 'nl' ? 'Hallo' : 'Hello' }))
		render(<LinguiI18nProvider i18n={i18n} loadCatalog={loadCatalog}>
			<TranslationCatalog path="example" fallback="Loading">
				<Trans id="greeting" />
			</TranslationCatalog>
			<TranslationCatalog path="example"><span /></TranslationCatalog>
		</LinguiI18nProvider>)

		expect(screen.getByText('Loading')).toBeTruthy()
		expect(await screen.findByText('Hello')).toBeTruthy()
		expect(loadCatalog).toHaveBeenCalledTimes(1)

		act(() => i18n.activate('nl'))
		expect(screen.getByText('Loading')).toBeTruthy()
		expect(await screen.findByText('Hallo')).toBeTruthy()
		expect(loadCatalog).toHaveBeenCalledTimes(2)
	})
})

describe('I18nProvider', () => {
	it('provides locale settings and loads each catalog once', async () => {
		const catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [] } as const
		const loadCatalog = vi.fn(async () => catalog)
		let runtime: I18nRuntime | undefined

		function Consumer() {
			runtime = useI18n()
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}><Consumer /></I18nProvider>)
		expect(runtime?.locale).toBe('nl')
		expect(runtime?.sourceLocale).toBe('en')

		await act(async () => {
			const firstLoad = runtime!.loadCatalog('nl', 'pages/home')
			expect(runtime!.isCatalogLoading('nl', 'pages/home')).toBe(true)
			const [first, second] = await Promise.all([firstLoad, runtime!.loadCatalog('nl', 'pages/home')])
			expect(first).toBe(catalog)
			expect(second).toBe(catalog)
		})

		expect(loadCatalog).toHaveBeenCalledTimes(1)
		expect(runtime?.getCatalog('nl', 'pages/home')).toBe(catalog)
		expect(runtime?.isCatalogLoaded('nl', 'pages/home')).toBe(true)
	})

	it('validates loaded catalog locales', async () => {
		const loadCatalog = vi.fn(async () => ({ sourceLocale: 'en', targetLocale: 'de', entries: [] }))
		let runtime: I18nRuntime | undefined
		function Consumer() {
			runtime = useI18n()
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}><Consumer /></I18nProvider>)
		await expect(runtime!.loadCatalog('nl', 'pages/home')).rejects.toThrow('does not match requested locale')
	})
})
