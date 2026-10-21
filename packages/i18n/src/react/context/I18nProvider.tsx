import { type ReactNode, useMemo } from 'react'

import { type CatalogLoader, createCatalogStore } from './catalogStore.ts'
import { type SourceRegistrar, I18nContext } from './context.ts'

export type I18nProviderProps = {
	children: ReactNode
	locale: string
	sourceLocale: string
	loadCatalog?: CatalogLoader
	registerSource?: SourceRegistrar
}

export type { CatalogLoader } from './catalogStore.ts'

export function I18nProvider({ children, locale, sourceLocale, loadCatalog: catalogLoader, registerSource }: I18nProviderProps) {
	// Set up the catalog store and bundle the i18n context value.
	const catalogStore = useMemo(() => createCatalogStore(catalogLoader, sourceLocale), [catalogLoader, sourceLocale])
	const runtime = useMemo(() => ({
		locale,
		sourceLocale,
		catalogStore,
		getCatalog: catalogStore.getCatalog,
		isCatalogLoaded: catalogStore.isCatalogLoaded,
		isCatalogLoading: catalogStore.isCatalogLoading,
		loadCatalog: catalogStore.loadCatalog,
		registerSource,
	}), [catalogStore, locale, registerSource, sourceLocale])
	return <I18nContext.Provider value={runtime}>{children}</I18nContext.Provider>
}
