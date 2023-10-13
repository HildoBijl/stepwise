import React, { createContext, useContext } from 'react'

import { ensureString } from 'step-wise/util'

const TranslationSectionContext = createContext()

export function TranslationSection({ children, entry }) {
	// Check the input.
	entry = ensureString(entry, true)

	// Extend by a potential parent entry.
	const parentEntry = useTranslationSectionEntry()
	if (parentEntry)
		entry = `${parentEntry}.${entry}`

	// Render the provider.
	return (
		<TranslationSectionContext.Provider value={entry}>
			{children}
		</TranslationSectionContext.Provider>
	)
}

export function useTranslationSectionEntry() {
	return useContext(TranslationSectionContext)
}

export function applyTranslationSectionEntry(entry, contextEntry, apply = true) {
	// Check the input.
	if (!entry || typeof entry !== 'string')
		throw new Error(`Missing Translation entry: no entry for within the translation file has been provided for this Translation element.`)

	// Combine with any potential section entry.
	if (apply && contextEntry)
		entry = `${contextEntry}.${entry}`
	return entry
}

export function useTranslationEntry(entry, apply) {
	const contextEntry = useTranslationSectionEntry()
	return applyTranslationSectionEntry(entry, contextEntry, apply)
}
