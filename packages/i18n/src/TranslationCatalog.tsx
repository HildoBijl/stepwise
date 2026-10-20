import { type ReactNode, useEffect, useState } from 'react'
import { useLingui } from '@lingui/react'

import { getLinguiCatalogKey, useLinguiCatalogLoading } from './LinguiI18nProvider.tsx'

type TranslationCatalogProps = {
	children: ReactNode
	path: string
	fallback?: ReactNode
}

// Wrapper that makes sure the translation file is loaded for the given path.
export function TranslationCatalog({ children, path, fallback = null }: TranslationCatalogProps) {
	// Determine the file key from the language local and the path.
	const { i18n } = useLingui()
	const locale = i18n.locale
	const key = getLinguiCatalogKey(locale, path)

	// Track the loading status for the given key.
	const [loadedKey, setLoadedKey] = useState<string>()
	const [error, setError] = useState<unknown>()
	const catalogLoading = useLinguiCatalogLoading()
	const loaded = loadedKey === key || catalogLoading.isLoaded(locale, path)

	// Load in the respective language file.
	useEffect(() => {
		if (loaded) return
		let active = true
		setError(undefined)
		catalogLoading.load(locale, path)
			.then(() => { if (active) setLoadedKey(key) })
			.catch(error => { if (active) setError(error) })
		return () => { active = false }
	}, [catalogLoading, key, loaded, locale, path])

	// When the file is loaded, show the children.
	if (error) throw error
	return loaded ? children : fallback
}
