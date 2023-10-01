import { getDeepParameter } from 'step-wise/util'

import { isLocalhost } from 'util'

import { defaultLanguage } from '../../settings'
import { entryAsArray } from '../../util'
import { useLanguage, useTranslationFile } from '../../context'

import { applyBasicProcessing, elementToString, applyTranslation } from './transformation'

export function Translation({ path, entry, children }) {
	// Get the translation file. If it doesn't exist, render default content.
	const language = useLanguage()
	const translationFile = useTranslationFile(path)
	if (!translationFile)
		return applyBasicProcessing(children)

	// Get the respective entry from the translation file.
	const translation = getDeepParameter(translationFile, entryAsArray(entry))

	// If we are on the development server, and in the default language, then we check if the translation file is still up-to-date.
	if (isLocalhost() && language === defaultLanguage) {
		const expectedTranslation = elementToString(children)
		if (translation !== expectedTranslation) {
			console.log('Default language translation is outdated!')
			console.log(children)
			console.log(translation)
			console.log(expectedTranslation)
			// ToDo next: update the translation file. Send a request to the server (use the I18n hooks) to update the file.
			return applyBasicProcessing(children)
		}
	}

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
