import { useEffect } from 'react'

import { getDeepParameter, ensureString } from 'step-wise/util'

import { isLocalhost } from 'util/development'

import { defaultLanguage } from '../../settings'
import { entryAsArray } from '../../util'
import { useI18nData, useLanguage, useLanguageFile } from '../../context'

import { useTranslationFilePath } from '../TranslationFile'
import { useTranslationEntry } from '../TranslationSection'

import { applyNoTranslation, elementToString, applyTranslation } from './transformation'

export function Translation({ path, entry, children }) {
	// Extract the path and the entry, either from the parameters or from a context.
	const contextPath = useTranslationFilePath()
	if (!path && contextPath)
		path = contextPath
	path = ensureString(path)

	// Extract the entry. This combines it with a potential Section entry.
	entry = useTranslationEntry(entry)

	// Get the translation file and extract the respective entry.
	const language = useLanguage()
	const languageFile = useLanguageFile(path)
	const text = languageFile && getDeepParameter(languageFile, entryAsArray(entry))

	// If we are on the development server, and in the default language, then check if the translation file is still up-to-date. If not, update it.
	const { updateLanguageEntry } = useI18nData()
	useEffect(() => {
		if (isLocalhost() && language === defaultLanguage) {
			const expectedText = elementToString(children)
			if (languageFile && text !== expectedText)
				updateLanguageEntry(language, path, entry, expectedText)
		}
	}, [path, entry, language, children, languageFile, text, updateLanguageEntry])

	// If there is no translation, render the default content.
	if (!text)
		return applyNoTranslation(children)

	// Try to implement the translation.
	try {
		return applyTranslation(children, text)
	} catch (error) {
		// On a failure to implement the translation, keep the original text.
		if (isLocalhost())
			console.error(error)
		return applyNoTranslation(children)
	}
}
