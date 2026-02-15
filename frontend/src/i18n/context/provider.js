import React, { createContext, useContext, useState, useRef } from 'react'

import { keysToObject } from 'step-wise/util'
import { languages } from '@step-wise/settings'

import { useI18nHandlers, useInitialLanguage } from './handlers'

const I18nContext = createContext({})

export function I18nProvider({ children }) {
	// Define states.
	const [language, setLanguage] = useState()
	const [languageFiles, setLanguageFiles] = useState(keysToObject(languages, () => ({})))
	const loaderRef = useRef(keysToObject(languages, () => ({})))

	// Set up the initial language value based on various sources of information.
	useInitialLanguage(setLanguage)

	// Set up various handlers that have important functionalities.
	const handlers = useI18nHandlers({ setLanguage, setLanguageFiles, loaderRef })

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
