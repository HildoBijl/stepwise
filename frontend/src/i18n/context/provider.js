import React, { createContext, useContext, useState, useRef } from 'react'

import { keysToObject } from 'step-wise/util'

import { useLatest } from 'util/react'

import { languages, defaultLanguage } from '../settings'

import { useI18nHandlers } from './handlers'

const I18nContext = createContext({})

export function I18nProvider({ children }) {
	// Define states.
	const [language, setLanguage] = useState()
	const [translationFiles, setTranslationFiles] = useState(keysToObject(languages, () => ({})))
	const loaderRef = useRef(keysToObject(languages, () => ({})))
	const translationFilesRef = useLatest(translationFiles)

	// Set up various handlers that have important functionalities.
	const handlers = useI18nHandlers({ setLanguage, setTranslationFiles, translationFilesRef, loaderRef })

	// Check various sources of information to see if we can derive the language to be used.
	// ToDo.

	// Set up the context value.
	const value = {
		language,
		translationFiles,
		loaderRef,
		...handlers,
	}

	// Render the provider.
	return (
		<I18nContext.Provider value={value}>
			{children}
		</I18nContext.Provider>
	)
}

export function useI18nData() {
	return useContext(I18nContext)
}
