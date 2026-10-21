// @vitest-environment jsdom

import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { type I18nRuntime, I18nProvider, useCatalog, useI18n } from './index.ts'

describe('I18nProvider', () => {
	it('loads and provides a catalog through useCatalog', async () => {
		const catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [] } as const
		const loadCatalog = vi.fn(async () => catalog)
		let result: ReturnType<typeof useCatalog> | undefined

		function Consumer() {
			result = useCatalog(['pages'], 'home')
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}><Consumer /></I18nProvider>)
		expect(result).toEqual({ catalog: undefined, error: undefined, loading: true })
		await act(async () => {})
		expect(loadCatalog).toHaveBeenCalledWith('nl', 'pages/home')
		expect(result).toEqual({ catalog, error: undefined, loading: false })
	})

	it('provides catalog loading errors through useCatalog', async () => {
		const error = new Error('Catalog unavailable')
		const loadCatalog = vi.fn(async () => { throw error })
		let result: ReturnType<typeof useCatalog> | undefined

		function Consumer() {
			result = useCatalog(['pages'], 'home')
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}><Consumer /></I18nProvider>)
		await act(async () => {})
		expect(result).toEqual({ catalog: undefined, error, loading: false })
	})

	it('does not rerender a useCatalog consumer when an unrelated catalog loads', async () => {
		const catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [] } as const
		const loadCatalog = vi.fn(async () => catalog)
		let runtime: I18nRuntime | undefined
		let renderCount = 0

		function Consumer() {
			runtime = useI18n()
			useCatalog(['pages'], 'home')
			renderCount++
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}><Consumer /></I18nProvider>)
		await act(async () => {})
		const renderCountAfterHomeLoaded = renderCount
		await act(async () => { await runtime!.loadCatalog('nl', 'pages/settings') })
		expect(renderCount).toBe(renderCountAfterHomeLoaded)
	})

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
