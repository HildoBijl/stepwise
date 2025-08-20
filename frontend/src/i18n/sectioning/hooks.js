import { useState, useCallback } from 'react'

import { getDeepParameter, isObject } from 'step-wise/util'

import { isLocalhost, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { defaultLanguage } from '../settings'
import { entryAsArray } from '../util'
import { useI18nData, useLanguage, useLanguageFiles } from '../context'

import { useTranslationFilePath, applyTranslationFilePath } from './TranslationFile'
import { useTranslationSectionEntry, applyTranslationSectionEntry } from './TranslationSection'

// useTextTranslation will take a text (string) and aims to translate it. It only works on basic text and does not process React elements.
export function useTextTranslation(fallbackText, entry, path, extendEntry) {
	const translate = useTextTranslator()
	return translate(fallbackText, entry, path, extendEntry)
}

// useTextTranslator returns a function (text, entry, path) => translatedText that takes a text (string) and aims to translate it. It only works on basic text and does not process React elements.
export function useTextTranslator(translatorPath) {
	// Keep track of which language files are required and load them.
	const [pathsToLoad, setPathsToLoads] = useState({})
	const languageFiles = useLanguageFiles(Object.keys(pathsToLoad))
	const fallbackLanguageFiles = useLanguageFiles(Object.keys(pathsToLoad), defaultLanguage)

	// Get data and functionalities from the i18n context.
	const language = useLanguage()
	const { updateLanguageEntry } = useI18nData()

	// Get context data about files and sections.
	const contextPath = useTranslationFilePath()
	const contextEntry = useTranslationSectionEntry()

	// Set up the translator function.
	return useCallback((fallbackText, entry, path, extendEntry = true) => {
		// Process the path and the entry, based on the context of the translator.
		entry = applyTranslationSectionEntry(entry, contextEntry, extendEntry && !path && !translatorPath)
		path = applyTranslationFilePath(path || translatorPath, contextPath)

		// If the file path has not been requested yet, then do so.
		if (!pathsToLoad[path])
			setPathsToLoads(pathsToLoad => ({ ...pathsToLoad, [path]: true }))

		// Get the translation file and extract the respective entry. If the user language fails, try to use the default language as fallback.
		const fallbackLanguageFile = fallbackLanguageFiles[path]
		const languageFile = languageFiles[path] || fallbackLanguageFile
		let text = (languageFile && getDeepParameter(languageFile, entryAsArray(entry))) || (fallbackLanguageFile && getDeepParameter(fallbackLanguageFile, entryAsArray(entry)))

		// If the language file has loaded but there is no text and no fallbackText, then something is wrong. Although maybe the text is rendered later on in the page, so let's not end stuff, and only show a warning.
		if (languageFile && text === undefined && fallbackText === undefined) {
			console.error(`Invalid translation request: requested translation text for path "${path}" and entry "${entry}" but could not find this entry. Also no fallback text has been provided.`)
			return '[Translation missing]' // Show a placeholder indicating the problem.
		}

		// If the text is still an object, then we haven't zoomed in enough. No translation can be given. Show a warning.
		if (isObject(text)) {
			console.error(`Invalid translation request: requested translation text for path "${path}" and entry "${entry}" but this entry was still an object with multiple sub-entries. Check if your entry should be more specific with extra parameters specified.`)
			return fallbackText || '[Translation missing]' // Show a placeholder indicating the problem.
		}

		// If the language file has not loaded yet, and there is no fallback text, then we cannot show anything yet.
		if (!languageFile && fallbackText === undefined)
			return ''

		// If we are on the development server, and in the default language, then check if the translation file is still up-to-date. If not, update it.
		if (isLocalhost() && language === defaultLanguage) {
			if (languageFile && fallbackText !== undefined && fallbackText !== text)
				updateLanguageEntry(language, path, entry, fallbackText)
		}

		// Return the obtained text or, if it's not there yet, the fallback text.
		return text !== undefined ? text : fallbackText
	}, [translatorPath, contextPath, contextEntry, pathsToLoad, languageFiles, fallbackLanguageFiles, language, updateLanguageEntry])
}

// useGetTranslation will return a getTranslation function (entry, path, extendEntry) => translationEntry that looks up a given translation entry (a string) and returns it, or returns undefined when the entry does not exist or is still loading.
export function useGetTranslation(translatorPath) {
	const translator = useTextTranslator(translatorPath)
	return useStableCallback((entry, path, extendEntry) => translator(undefined, entry, path, extendEntry))
}
