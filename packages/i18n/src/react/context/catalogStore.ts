import { type Catalog, assertValidCatalog } from '../../catalog/index.ts'

export type CatalogLoader = (locale: string, path: string) => Promise<Catalog>

export type CatalogStore = {
	getCatalog: (locale: string, path: string) => Catalog | undefined
	getSnapshot: (locale: string, path: string) => CatalogSnapshot
	isCatalogLoaded: (locale: string, path: string) => boolean
	isCatalogLoading: (locale: string, path: string) => boolean
	loadCatalog: (locale: string, path: string) => Promise<Catalog>
	subscribe: (locale: string, path: string, listener: CatalogListener) => () => void
}

export type CatalogSnapshot = {
	catalog?: Catalog
	loading: boolean
	error?: unknown
}

type CatalogListener = () => void

const emptyCatalogSnapshot: CatalogSnapshot = { loading: false }

// Set up a Catalog store which manages the loading of Catalogs, providing updates to specific Catalogs when their loading status changes.
export function createCatalogStore(catalogLoader: CatalogLoader | undefined, sourceLocale: string): CatalogStore {
	// Set up the memory for the Catalogs, their loading and the listeners.
	const snapshots = new Map<string, CatalogSnapshot>()
	const pendingCatalogs = new Map<string, Promise<Catalog>>()
	const listeners = new Map<string, Set<CatalogListener>>()

	// Set up basic getters and checks.
	const getSnapshot = (locale: string, path: string): CatalogSnapshot => snapshots.get(getCatalogKey(locale, path)) ?? emptyCatalogSnapshot
	const getCatalog = (locale: string, path: string): Catalog | undefined => getSnapshot(locale, path).catalog
	const isCatalogLoaded = (locale: string, path: string): boolean => !!getCatalog(locale, path)
	const isCatalogLoading = (locale: string, path: string): boolean => getSnapshot(locale, path).loading

	// Handler that starts listening for updates on a given Catalog file's loading status.
	const subscribe = (locale: string, path: string, listener: CatalogListener) => {
		const key = getCatalogKey(locale, path)
		const keyListeners = listeners.get(key) ?? new Set<CatalogListener>()
		keyListeners.add(listener)
		listeners.set(key, keyListeners)
		return () => {
			keyListeners.delete(listener)
			if (keyListeners.size === 0) listeners.delete(key)
		}
	}

	// Whenever the snapshot for a Catalog file changes, store it and notify listeners.
	const setSnapshot = (key: string, snapshot: CatalogSnapshot): void => {
		snapshots.set(key, snapshot)
		listeners.get(key)?.forEach(listener => listener())
	}

	// Handler that loads in a given Catalog file.
	const loadCatalog = (locale: string, path: string): Promise<Catalog> => {
		// If the catalog already loaded, directly return it.
		const key = getCatalogKey(locale, path)
		const loadedCatalog = snapshots.get(key)?.catalog
		if (loadedCatalog) return Promise.resolve(loadedCatalog)

		// If the catalog is in the process of loading, return the corresponding promise.
		const pendingCatalog = pendingCatalogs.get(key)
		if (pendingCatalog) return pendingCatalog

		// If no loader is available, store and return the resulting failure.
		if (!catalogLoader) {
			const error = new Error('Cannot load a translation catalog: no catalog loader has been configured.')
			setSnapshot(key, { loading: false, error })
			return Promise.reject(error)
		}

		// Start loading the catalog. Upon completion, validate and store either the Catalog file or the error.
		setSnapshot(key, { loading: true })
		const promise = Promise.resolve().then(() => catalogLoader(locale, path)).then(catalog => {
			assertValidCatalog(catalog)
			assertCatalogLocales(catalog, sourceLocale, locale)
			setSnapshot(key, { catalog, loading: false })
			return catalog
		}).catch(error => {
			setSnapshot(key, { loading: false, error })
			throw error
		}).finally(() => pendingCatalogs.delete(key))
		pendingCatalogs.set(key, promise)
		return promise
	}

	// Return all functions together as the Catalog store.
	return { getCatalog, getSnapshot, isCatalogLoaded, isCatalogLoading, loadCatalog, subscribe }
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
