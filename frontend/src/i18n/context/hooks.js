import { useEffect } from 'react'

import { keysToObject } from 'step-wise/util'

import { languages, defaultLanguage } from '../settings'
import { pathAsString, setStoredLanguage } from '../util'

import { useI18nData } from './provider'

export function useLanguage() {
	return useI18nData().language || defaultLanguage
}

export function useSetLanguage() {
	return useI18nData().setLanguage
}

export function useLanguageFiles(paths) {
	const { languageFiles, requestLanguageFile, loaderRef } = useI18nData()
	const language = useLanguage()

	// Walk through the array of paths and load each of them. Merge the results into one object.
	return keysToObject(paths, path => {
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
	})
}

export function useLanguageFile(path) {
	return useLanguageFiles([path])[path]
}

// useLanguageSetting can be used by a child component that wants to set the language. If it gives a valid language, it is immediately applied.
export function useLanguageSetting(language, storeLanguage = true) {
	const setLanguage = useSetLanguage()
	useEffect(() => {
		// Don't apply the language if it's not a valid language. (Like it's undefined, or something random.)
		if (!languages.includes(language))
			return

		// Apply the language.
		setLanguage(language)
		if (storeLanguage)
			setStoredLanguage(language)
	}, [language, setLanguage, storeLanguage])
}
