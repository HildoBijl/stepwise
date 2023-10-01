import { defaultLanguage } from '../settings'

import { useI18nData } from './provider'

import { pathAsString } from '../util'

export function useLanguage() {
	return useI18nData().language || defaultLanguage
}

export function useSetLanguage() {
	return useI18nData().setLanguage
}

export function useLanguageFile(path) {
	const { languageFiles, requestLanguageFile, loaderRef } = useI18nData()
	const language = useLanguage()

	// If the translation file has been loaded, return it. Otherwise request it.
	path = pathAsString(path)
	if (languageFiles[language][path])
		return languageFiles[language][path]
	requestLanguageFile(language, path)

	// Try the default language instead.
	if (languageFiles[defaultLanguage][path])
		return languageFiles[defaultLanguage][path]

	// If the given language has tried loading but ended up empty, also try loading the default language.
	if (loaderRef.current[language][path] === false)
		requestLanguageFile(defaultLanguage, path)

	// Nothing can be returned yet.
	return undefined
}
