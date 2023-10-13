import { useState } from 'react'

import { getDeepParameter } from 'step-wise/util'

import { useStableCallback } from 'util/react'
import { isLocalhost } from 'util/development'

import { defaultLanguage } from '../settings'
import { entryAsArray } from '../util'
import { useI18nData, useLanguage, useLanguageFiles } from '../context'

import { useTranslationFilePath, applyTranslationFilePath } from './TranslationFile'
import { useTranslationSectionEntry, applyTranslationSectionEntry } from './TranslationSection'

export function useTranslation(fallbackText, entry, path) {
	const translate = useTranslator()
	return translate(fallbackText, entry, path)
}

export function useTranslator(translatorPath) {
	// Keep track of which language files are required and load them.
	const [pathsToLoad, setPathsToLoads] = useState({})
	const languageFiles = useLanguageFiles(Object.keys(pathsToLoad))

	// Get data and functionalities from the i18n context.
	const language = useLanguage()
	const { updateLanguageEntry } = useI18nData()

	// Get context data about files and sections.
	const contextPath = useTranslationFilePath()
	const contextEntry = useTranslationSectionEntry()

	// Set up the translator function.
	return useStableCallback((fallbackText, entry, path) => {
		// Process the path and the entry, based on the context of the translator.
		entry = applyTranslationSectionEntry(entry, contextEntry, !path)
		path = applyTranslationFilePath(path || translatorPath, contextPath)

		// If the file path has not been requested yet, then do so.
		if (!pathsToLoad[path])
			setPathsToLoads(pathsToLoad => ({ ...pathsToLoad, [path]: true }))

		// Get the translation file and extract the respective entry.
		const languageFile = languageFiles[path]
		const text = languageFile && getDeepParameter(languageFile, entryAsArray(entry))

		// If we are on the development server, and in the default language, then check if the translation file is still up-to-date. If not, update it.
		if (isLocalhost() && language === defaultLanguage) {
			if (languageFile && text !== fallbackText)
				updateLanguageEntry(language, path, entry, fallbackText)
		}

		// Return the obtained text or, if it's not there yet, the fallback text.
		return text !== undefined ? text : fallbackText
	})
}
