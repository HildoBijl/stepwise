import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react'
import { type I18n, type Messages } from '@lingui/core'
import { I18nProvider as LinguiI18nProvider } from '@lingui/react'

export type CatalogLoader = (locale: string, path: string) => Promise<Messages>

/*
 * Context that is used to distribute the i18n loader.
 */

type CatalogLoading = {
	isLoaded: (locale: string, path: string) => boolean
	load: (locale: string, path: string) => Promise<void>
}

const CatalogLoadingContext = createContext<CatalogLoading | undefined>(undefined)

/*
 * Provider that sets up and provides the i18n loader function.
 */

type I18nProviderProps = {
	children: ReactNode
	i18n: I18n
	loadCatalog?: CatalogLoader
}

export function I18nProvider({ children, i18n, loadCatalog }: I18nProviderProps) {
	const loadedCatalogs = useRef(new Set<string>())
	const pendingCatalogs = useRef(new Map<string, Promise<void>>())

	// Async command that starts the loading of a catalog.
	const load = useCallback((locale: string, path: string): Promise<void> => {
		if (!loadCatalog) throw new Error('Cannot load a translation catalog: no catalog loader has been configured.')

		// If the catalog has been loaded, do nothing.
		const key = getCatalogKey(locale, path)
		if (loadedCatalogs.current.has(key)) return Promise.resolve()

		// If this catalog is still loading, return the respective promise.
		const pendingCatalog = pendingCatalogs.current.get(key)
		if (pendingCatalog) return pendingCatalog

		// Start loading the catalog. Upon completion, store it. Return the respective promise.
		const promise = loadCatalog(locale, path)
			.then(messages => {
				i18n.load(locale, messages)
				loadedCatalogs.current.add(key)
			})
			.finally(() => pendingCatalogs.current.delete(key))
		pendingCatalogs.current.set(key, promise)
		return promise
	}, [i18n, loadCatalog])

	// Check to see if a catalog has been loaded.
	const isLoaded = useCallback((locale: string, path: string) => loadedCatalogs.current.has(getCatalogKey(locale, path)), [])

	// Set up the context's value and provide it. Also prodive the usual Lingui context.
	const catalogLoading = useMemo(() => ({ isLoaded, load }), [isLoaded, load])
	return <CatalogLoadingContext.Provider value={catalogLoading}>
		<LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>
	</CatalogLoadingContext.Provider>
}

/*
 * Support functions.
 */

// The hook that accesses the catalog loading context.
export function useCatalogLoading(): CatalogLoading {
	const catalogLoading = useContext(CatalogLoadingContext)
	if (!catalogLoading) throw new Error('useCatalogLoading must be used within an I18nProvider.')
	return catalogLoading
}

// Turn a locale string and a catalog file path into a single string: a key.
export function getCatalogKey(locale: string, path: string): string {
	return `${locale}:${path}`
}
