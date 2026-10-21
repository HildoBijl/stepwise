// @vitest-environment jsdom

import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../context/I18nProvider.tsx'

import { useCatalogAddress, useScopedCatalog, useTranslationScope } from './hooks.ts'
import { resolveCatalogAddress, resolveCatalogUnitAddress } from './resolution.ts'
import { TranslationCatalog } from './TranslationCatalog.tsx'
import { TranslationFolder } from './TranslationFolder.tsx'
import { TranslationGroup } from './TranslationGroup.tsx'
import { type TranslationScope } from './types.ts'

describe('translation scoping', () => {
	it('extends and replaces folder paths', () => {
		let scope: TranslationScope | undefined
		const CaptureScope = () => {
			scope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path="ignored">
			<TranslationFolder path="eduTools" extend={false}>
				<TranslationFolder path="exercises"><CaptureScope /></TranslationFolder>
			</TranslationFolder>
		</TranslationFolder>)

		expect(scope).toEqual({ folder: ['eduTools', 'exercises'], group: [] })
	})

	it('selects a catalog and extends or replaces its group path', () => {
		let extendedScope: TranslationScope | undefined
		let replacedScope: TranslationScope | undefined

		function CaptureScopes() {
			extendedScope = useTranslationScope()
			return <TranslationGroup path="buttons" extend={false}><ReplacedScope /></TranslationGroup>
		}
		function ReplacedScope() {
			replacedScope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path="eduTools">
			<TranslationCatalog name="exerciseManager">
				<TranslationGroup path={['controls', 'buttons']}><CaptureScopes /></TranslationGroup>
			</TranslationCatalog>
		</TranslationFolder>)

		expect(extendedScope).toEqual({ folder: ['eduTools'], catalog: 'exerciseManager', group: ['controls', 'buttons'] })
		expect(replacedScope).toEqual({ folder: ['eduTools'], catalog: 'exerciseManager', group: ['buttons'] })
	})

	it('lets a catalog replace the contextual folder', () => {
		let scope: TranslationScope | undefined
		const CaptureScope = () => {
			scope = useTranslationScope()
			return null
		}

		render(<TranslationFolder path={['ignored']}>
			<TranslationCatalog folder={['pages']} name="home"><CaptureScope /></TranslationCatalog>
		</TranslationFolder>)

		expect(scope).toEqual({ folder: ['pages'], catalog: 'home', group: [] })
	})

	it('lets a nested catalog replace the catalog and reset the group for its subtree', () => {
		const scopes: TranslationScope[] = []
		const CaptureScope = () => {
			scopes.push(useTranslationScope())
			return null
		}

		render(<TranslationFolder path={['eduTools']}>
			<TranslationCatalog name="outer">
				<TranslationGroup path="controls">
					<CaptureScope />
					<TranslationCatalog name="inner"><CaptureScope /></TranslationCatalog>
					<CaptureScope />
				</TranslationGroup>
			</TranslationCatalog>
		</TranslationFolder>)

		expect(scopes).toEqual([
			{ folder: ['eduTools'], catalog: 'outer', group: ['controls'] },
			{ folder: ['eduTools'], catalog: 'inner', group: [] },
			{ folder: ['eduTools'], catalog: 'outer', group: ['controls'] },
		])
	})

	it('resolves cascading explicit Catalog unit addresses', () => {
		const scope = { folder: ['eduTools'], catalog: 'exerciseManager', group: ['controls'] }
		expect(resolveCatalogUnitAddress(scope, { id: 'submit' })).toEqual({ ...scope, id: 'submit' })
		expect(resolveCatalogUnitAddress(scope, { group: ['buttons'], id: 'submit' })).toEqual({ ...scope, group: ['buttons'], id: 'submit' })
		expect(resolveCatalogUnitAddress(scope, { catalog: 'shared', group: [], id: 'submit' })).toEqual({ folder: ['eduTools'], catalog: 'shared', group: [], id: 'submit' })
		expect(resolveCatalogUnitAddress(scope, { folder: ['common'], catalog: 'shared', group: ['buttons'], id: 'submit' })).toEqual({ folder: ['common'], catalog: 'shared', group: ['buttons'], id: 'submit' })
	})

	it('resolves scoped and explicit Catalog addresses', () => {
		const scope = { folder: ['eduTools'], catalog: 'exerciseManager', group: ['controls'] }
		expect(resolveCatalogAddress(scope)).toEqual({ folder: ['eduTools'], catalog: 'exerciseManager' })
		expect(resolveCatalogAddress(scope, { catalog: 'shared' })).toEqual({ folder: ['eduTools'], catalog: 'shared' })
		expect(resolveCatalogAddress(scope, { folder: ['common'], catalog: 'shared' })).toEqual({ folder: ['common'], catalog: 'shared' })
	})

	it('provides the resolved Catalog address through a hook', () => {
		let address: ReturnType<typeof useCatalogAddress> | undefined

		function Consumer() {
			address = useCatalogAddress({ catalog: 'shared' })
			return null
		}

		render(<TranslationFolder path="eduTools">
			<TranslationCatalog name="exerciseManager"><Consumer /></TranslationCatalog>
		</TranslationFolder>)

		expect(address).toEqual({ folder: ['eduTools'], catalog: 'shared' })
	})

	it('loads the catalog belonging to the resolved Catalog address', async () => {
		const catalog = { sourceLocale: 'en', targetLocale: 'nl', entries: [] } as const
		const loadCatalog = vi.fn(async () => catalog)
		let result: ReturnType<typeof useScopedCatalog> | undefined

		function Consumer() {
			result = useScopedCatalog()
			return null
		}

		render(<I18nProvider locale="nl" sourceLocale="en" loadCatalog={loadCatalog}>
			<TranslationCatalog folder={['eduTools', 'exercises']} name="exerciseManager">
				<TranslationGroup path="ignored"><Consumer /></TranslationGroup>
			</TranslationCatalog>
		</I18nProvider>)

		await act(async () => {})
		expect(loadCatalog).toHaveBeenCalledWith('nl', 'eduTools/exercises/exerciseManager')
		expect(result).toEqual({
			address: { folder: ['eduTools', 'exercises'], catalog: 'exerciseManager' },
			catalog,
			loading: false,
		})
	})

	it('rejects invalid scope nesting', () => {
		expect(() => render(<TranslationGroup path="orphan"><span /></TranslationGroup>)).toThrow('must be used inside a TranslationCatalog')
		expect(() => render(<TranslationCatalog name="outer"><TranslationFolder path={['inner']}><span /></TranslationFolder></TranslationCatalog>)).toThrow('cannot be used inside a TranslationCatalog')
	})
})
