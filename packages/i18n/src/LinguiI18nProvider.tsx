import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react'
import { type I18n, type Messages } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

export type LinguiCatalogLoader = (locale: string, path: string) => Promise<Messages>

type LinguiCatalogLoading = {
	isLoaded: (locale: string, path: string) => boolean
	load: (locale: string, path: string) => Promise<void>
}

const LinguiCatalogLoadingContext = createContext<LinguiCatalogLoading | undefined>(undefined)

type LinguiI18nProviderProps = {
	children: ReactNode
	i18n: I18n
	loadCatalog?: LinguiCatalogLoader
}

// Temporary compatibility provider for the Lingui trial during the XLIFF migration.
export function LinguiI18nProvider({ children, i18n, loadCatalog }: LinguiI18nProviderProps) {
	const loadedCatalogs = useRef(new Set<string>())
	const pendingCatalogs = useRef(new Map<string, Promise<void>>())

	const load = useCallback((locale: string, path: string): Promise<void> => {
		if (!loadCatalog) throw new Error('Cannot load a Lingui catalog: no catalog loader has been configured.')
		const key = getLinguiCatalogKey(locale, path)
		if (loadedCatalogs.current.has(key)) return Promise.resolve()
		const pendingCatalog = pendingCatalogs.current.get(key)
		if (pendingCatalog) return pendingCatalog

		const promise = loadCatalog(locale, path)
			.then(messages => {
				i18n.load(locale, messages)
				loadedCatalogs.current.add(key)
			})
			.finally(() => pendingCatalogs.current.delete(key))
		pendingCatalogs.current.set(key, promise)
		return promise
	}, [i18n, loadCatalog])

	const isLoaded = useCallback((locale: string, path: string) => loadedCatalogs.current.has(getLinguiCatalogKey(locale, path)), [])
	const catalogLoading = useMemo(() => ({ isLoaded, load }), [isLoaded, load])
	return <LinguiCatalogLoadingContext.Provider value={catalogLoading}>
		<I18nProvider i18n={i18n}>{children}</I18nProvider>
	</LinguiCatalogLoadingContext.Provider>
}

export function useLinguiCatalogLoading(): LinguiCatalogLoading {
	const catalogLoading = useContext(LinguiCatalogLoadingContext)
	if (!catalogLoading) throw new Error('useLinguiCatalogLoading must be used within a LinguiI18nProvider.')
	return catalogLoading
}

export function getLinguiCatalogKey(locale: string, path: string): string {
	return `${locale}:${path}`
}
