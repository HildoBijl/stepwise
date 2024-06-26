import React, { createContext, useContext } from 'react'

import { ensureString } from 'step-wise/util'

import { ResetTranslationSection } from './TranslationSection'

const TranslationFileContext = createContext()

export function TranslationFile({ children, path, extend = true }) {
	// Check the input.
	path = ensureString(path, true)

	// Extend by a potential parent path.
	const parentPath = useTranslationFilePath()
	if (extend && parentPath)
		path = `${parentPath}/${path}`

	// Render the provider. Also reset any potential section.
	return (
		<TranslationFileContext.Provider value={path}>
			<ResetTranslationSection>
				{children}
			</ResetTranslationSection>
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
