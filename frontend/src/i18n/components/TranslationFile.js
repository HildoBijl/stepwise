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
