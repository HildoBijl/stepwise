import React, { createContext, useContext } from 'react'

import { TranslationCatalog } from '@step-wise/i18n'
import { ensureString } from '@step-wise/js-utils'

import { ResetTranslationSection } from './TranslationSection'

const TranslationFileContext = createContext()

export function TranslationFile({ children, path, extend = true }) {
	// Check the input.
	path = ensureString(path, { nonEmpty: true })

	// Extend by a potential parent path.
	const parentPath = useTranslationFilePath()
	if (extend && parentPath)
		path = `${parentPath}/${path}`

	// Split the old file path into the new Catalog's folder and name.
	const pathParts = path.split('/')
	const catalog = pathParts.pop()

	// Render both providers during the transition. A new Catalog also resets its group scope.
	return (
		<TranslationFileContext.Provider value={path}>
			<TranslationCatalog folder={pathParts} name={catalog}>
				<ResetTranslationSection>
					{children}
				</ResetTranslationSection>
			</TranslationCatalog>
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
