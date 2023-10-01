import { useStableCallback } from 'util/react'

import { languages } from '../settings'
import { pathAsString } from '../util'
import { loadLanguageFile } from '../loadLanguageFile'

export function useI18nHandlers({ setLanguage: setLanguageState, setTranslationFiles, loaderRef }) {
	// setLanguage will do a brief check to see if the given language is OK, and then apply it.
	const setLanguage = useStableCallback((language) => {
		if (!languages.includes(language))
			throw new Error(`Invalid language setting: tried to set the language to "${language}" but this is not among the supported languages.`)
		setLanguageState(language)
	})

	// requestTranslationFile will start loading a translation file, assuming this hasn't already been requested.
	const requestTranslationFile = useStableCallback((language, path) => {
		// If the translation file is already being loaded, do nothing.
		path = pathAsString(path)
		if (loaderRef.current[language][path] !== undefined)
			return

		// Start loading the translation file. Store the promise until it resolves.
		loaderRef.current[language][path] = loadLanguageFile(language, path)
		loaderRef.current[language][path].then(result => {
			setTranslationFiles(translationFiles => ({
				...translationFiles,
				[language]: {
					...translationFiles[language],
					[path]: result,
				}
			}))
			loaderRef.current[language][path] = true // Loading completed successfully.
		}).catch(error => {
			loaderRef.current[language][path] = false // Loading failed.
			console.error(error)
		})
	})

	// Return all the defined handlers.
	return { setLanguage, requestTranslationFile }
}
