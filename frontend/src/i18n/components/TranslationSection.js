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

// useTranslationEntry is used in the Translation component to get the entry. It combines a given entry with the entry of the encompassing Section.
export function useTranslationEntry(entry) {
	entry = ensureString(entry, true)
	const sectionEntry = useTranslationSectionEntry()
	if (sectionEntry)
		entry = `${sectionEntry}.${entry}`
	return entry
}
