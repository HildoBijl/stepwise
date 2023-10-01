import { useEffect } from 'react'

import { getDeepParameter } from 'step-wise/util'

import { isLocalhost } from 'util'

import { defaultLanguage } from '../../settings'
import { entryAsArray } from '../../util'
import { useI18nData, useLanguage, useLanguageFile } from '../../context'

import { applyBasicProcessing, elementToString, applyTranslation } from './transformation'

export function Translation({ path, entry, children }) {
	// Get the translation file and extract the respective entry.
	const { updateLanguageEntry } = useI18nData()
	const language = useLanguage()
	const languageFile = useLanguageFile(path)
	const translation = languageFile && getDeepParameter(languageFile, entryAsArray(entry))

	// If we are on the development server, and in the default language, then check if the translation file is still up-to-date. If not, update it.
	useEffect(() => {
		if (isLocalhost() && language === defaultLanguage) {
			const expectedTranslation = elementToString(children)
			if (languageFile && translation !== expectedTranslation)
				updateLanguageEntry(language, path, entry, expectedTranslation)
		}
	}, [path, entry, language, children, languageFile, translation, updateLanguageEntry])

	// If there is no translation, render the default content.
	if (!translation)
		return applyBasicProcessing(children)

	// Try to implement the translation.
	try {
		return applyTranslation(children, translation)
	} catch (error) {
		// On a failure to implement the translation, keep the original text.
		if (isLocalhost())
			console.error(error)
		return applyBasicProcessing(children)
	}
}
