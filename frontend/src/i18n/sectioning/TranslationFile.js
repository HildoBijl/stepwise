import React, { createContext, useContext } from 'react'

import { ensureString } from 'step-wise/util'

const TranslationFileContext = createContext()

export function TranslationFile({ children, path }) {
	// Check the input.
	path = ensureString(path, true)

	// Render the provider.
	return (
		<TranslationFileContext.Provider value={path}>
			{children}
		</TranslationFileContext.Provider>
	)
}

export function useTranslationFilePath() {
	return useContext(TranslationFileContext)
}

export function applyTranslationFilePath(path, contextPath) {
	if (!path && contextPath)
		path = contextPath
	if (!path || typeof path !== 'string')
		throw new Error(`Missing Translation path: no path to a translation file has been provided for this translation request. Either specify the path manually or (more common) make sure the request is made from inside a TranslationFile parent element.`)
	return path
}

export function useTranslationPath(path) {
	const contextPath = useTranslationFilePath()
	return applyTranslationFilePath(path, contextPath)
}
