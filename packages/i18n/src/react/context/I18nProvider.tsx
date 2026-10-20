import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { type Catalog, assertValidCatalog } from '../../catalog/index.ts'

import { type SourceRegistrar, I18nContext } from './context.ts'

export type I18nProviderProps = {
	children: ReactNode
	locale: string
	sourceLocale: string
	loadCatalog?: CatalogLoader
	registerSource?: SourceRegistrar
}

export type CatalogLoader = (locale: string, path: string) => Promise<Catalog>

export function I18nProvider({ children, locale, sourceLocale, loadCatalog: catalogLoader, registerSource }: I18nProviderProps) {
	// Set up storage for the catalog loading.
	const [catalogs, setCatalogs] = useState<ReadonlyMap<string, Catalog>>(() => new Map())
	const [loadingCatalogs, setLoadingCatalogs] = useState<ReadonlySet<string>>(() => new Set())
	const pendingCatalogs = useRef(new Map<string, Promise<Catalog>>())

	// Basic checks on getting the catalogs and their loading status.
	const getCatalog = useCallback((locale: string, path: string) => catalogs.get(getCatalogKey(locale, path)), [catalogs])
	const isCatalogLoaded = useCallback((locale: string, path: string) => catalogs.has(getCatalogKey(locale, path)), [catalogs])
	const isCatalogLoading = useCallback((locale: string, path: string) => pendingCatalogs.current.has(getCatalogKey(locale, path)), [])

	// Handler that starts loading in a new catalog.
	const loadCatalog = useCallback((locale: string, path: string): Promise<Catalog> => {
		// If the catalog already loaded, directly return it.
		const key = getCatalogKey(locale, path)
		const loadedCatalog = catalogs.get(key)
		if (loadedCatalog) return Promise.resolve(loadedCatalog)
		if (!catalogLoader) throw new Error('Cannot load a translation catalog: no catalog loader has been configured.')

		// If the catalog is in the process of loading, return the corresponding promise.
		const pendingCatalog = pendingCatalogs.current.get(key)
		if (pendingCatalog) return pendingCatalog

		// Start loading the catalog. Upon completion, check and store it, and note that it's not loading anymore.
		setLoadingCatalogs(keys => new Set(keys).add(key))
		const promise = catalogLoader(locale, path).then(catalog => {
			assertValidCatalog(catalog)
			assertCatalogLocales(catalog, sourceLocale, locale)
			setCatalogs(catalogs => new Map(catalogs).set(key, catalog))
			return catalog
		}).finally(() => {
			pendingCatalogs.current.delete(key)
			setLoadingCatalogs(keys => {
				const nextKeys = new Set(keys)
				nextKeys.delete(key)
				return nextKeys
			})
		})
		pendingCatalogs.current.set(key, promise)
		return promise
	}, [catalogLoader, catalogs, sourceLocale])

	// Bundle the i18n context value and wrap it in the provider.
	const runtime = useMemo(() => ({ locale, sourceLocale, catalogs, loadingCatalogs, getCatalog, isCatalogLoaded, isCatalogLoading, loadCatalog, registerSource }), [catalogs, getCatalog, isCatalogLoaded, isCatalogLoading, loadCatalog, loadingCatalogs, locale, registerSource, sourceLocale])
	return <I18nContext.Provider value={runtime}>{children}</I18nContext.Provider>
}

// Verify that the given Catalog is the one we need for the given sourceLocale and locale values.
function assertCatalogLocales(catalog: Catalog, sourceLocale: string, locale: string): void {
	if (catalog.sourceLocale !== sourceLocale) throw new Error(`Catalog source locale "${catalog.sourceLocale}" does not match configured source locale "${sourceLocale}".`)
	if (locale === sourceLocale && catalog.targetLocale !== undefined) throw new Error('A source-language catalog cannot define a target locale.')
	if (locale !== sourceLocale && catalog.targetLocale !== locale) throw new Error(`Catalog target locale "${catalog.targetLocale ?? ''}" does not match requested locale "${locale}".`)
}

// Turn a catalog locale and path into a unique key referencing the file.
function getCatalogKey(locale: string, path: string): string {
	return `${locale}:${path}`
}
