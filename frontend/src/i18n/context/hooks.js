import { defaultLanguage } from '../settings'

import { useI18nData } from './provider'

import { pathAsString } from '../util'

export function useLanguage() {
	return useI18nData().language || defaultLanguage
}

export function useSetLanguage() {
	return useI18nData().setLanguage
}

export function useTranslationFile(path) {
	const { translationFiles, requestTranslationFile, loaderRef } = useI18nData()
	const language = useLanguage()

	// If the translation file has been loaded, return it. Otherwise request it.
	path = pathAsString(path)
	if (translationFiles[language][path])
		return translationFiles[language][path]
	requestTranslationFile(language, path)

	// Try the default language instead.
	if (translationFiles[defaultLanguage][path])
		return translationFiles[defaultLanguage][path]

	// If the given language has tried loading but ended up empty, also try loading the default language.
	if (loaderRef.current[language][path] === false)
		requestTranslationFile(defaultLanguage, path)

	// Nothing can be returned yet.
	return undefined
}
