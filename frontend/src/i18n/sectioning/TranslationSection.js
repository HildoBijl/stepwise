import React, { createContext, useContext } from 'react'

import { ensureString } from 'step-wise/util'

const TranslationSectionContext = createContext()

export function TranslationSection({ children, entry, extend = true }) {
	// Check the input.
	entry = ensureString(entry, true)

	// Extend by a potential parent entry.
	const parentEntry = useTranslationSectionEntry()
	if (extend && parentEntry)
		entry = `${parentEntry}.${entry}`

	// Render the provider.
	return (
		<TranslationSectionContext.Provider value={entry}>
			{children}
		</TranslationSectionContext.Provider>
	)
}

export function ResetTranslationSection({ children }) {
	return (
		<TranslationSectionContext.Provider value={undefined}>
			{children}
		</TranslationSectionContext.Provider>
	)
}

export function useTranslationSectionEntry() {
	return useContext(TranslationSectionContext)
}

export function applyTranslationSectionEntry(entry, contextEntry, extendEntry = true) {
	// If there is no entry and no contextEntry (or the contextEntry is not applied) then something is wrong.
	if (!entry && (!contextEntry || !extendEntry))
		throw new Error(`Missing Translation entry: no entry for within the translation file has been provided for this Translation element.`)

	// If there is no entry, use the contextEntry as entry.
	if (!entry && extendEntry)
		return contextEntry

	// Combine the entry with the potential contextEntry from the section.
	if (extendEntry && contextEntry)
		entry = `${contextEntry}.${entry}`
	return entry
}

