import React, { createContext, useContext, useState, useRef } from 'react'

import { keysToObject } from 'step-wise/util'

import { languages } from '../settings'

import { useI18nHandlers } from './handlers'

const I18nContext = createContext({})

export function I18nProvider({ children }) {
	// Define states.
	const [language, setLanguage] = useState()
	const [languageFiles, setLanguageFiles] = useState(keysToObject(languages, () => ({})))
	const loaderRef = useRef(keysToObject(languages, () => ({})))

	// Set up various handlers that have important functionalities.
	const handlers = useI18nHandlers({ setLanguage, setLanguageFiles, loaderRef })

	// Check various sources of information to see if we can derive the language to be used.
	// ToDo.

	// Set up the context value.
	const value = {
		language,
		languageFiles,
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
