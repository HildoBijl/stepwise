import { useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

import { type TranslationFolderPath } from '../scoping/types.ts'

import { type CatalogSnapshot } from './catalogStore.ts'
import { I18nContext, type I18nRuntime } from './context.ts'

export type UseCatalogResult = CatalogSnapshot

// Get the full I18nProvider context.
export function useI18n(): I18nRuntime {
	const runtime = useContext(I18nContext)
	if (!runtime) throw new Error('useI18n must be used within an I18nProvider.')
	return runtime
}

// Load in a Catalog file.
export function useCatalog(folder: TranslationFolderPath, catalogName: string): UseCatalogResult {
	const { catalogStore, locale } = useI18n()

	// Subscribe to updates for this specific Catalog file.
	const path = [...folder, catalogName].join('/')
	const subscribe = useCallback((listener: () => void) => catalogStore.subscribe(locale, path, listener), [catalogStore, locale, path])
	const getSnapshot = useCallback(() => catalogStore.getSnapshot(locale, path), [catalogStore, locale, path])
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

	// If the file does not exist yet, start loading it through an effect.
	useEffect(() => {
		if (snapshot.catalog || snapshot.loading || snapshot.error) return
		async function load() {
			try {
				await catalogStore.loadCatalog(locale, path)
			} catch {
				// The catalog store exposes the error through its snapshot.
			}
		}
		void load()
	}, [catalogStore, locale, path, snapshot])

	// Return the Catalog file with the respective loading status.
	return snapshot
}
