import { useContext, useEffect } from 'react'

import { type Language, languages } from '../settings.ts'

import { LanguageContext } from './context.ts'

// Get the current language setting.
export function useLanguage(): Language {
	const context = useContext(LanguageContext)
	if (!context) throw new Error('useLanguage must be used within a LanguageProvider.')
	return context.language
}

// Get the setLanguage function.
export function useSetLanguage(): (language: Language) => void {
	const context = useContext(LanguageContext)
	if (!context) throw new Error('useSetLanguage must be used within a LanguageProvider.')
	return context.setLanguage
}

// Get the language and a setter as a React useState pair.
export function useLanguageSetting(language: string | undefined): void {
	const setLanguage = useSetLanguage()
	useEffect(() => {
		if (!languages.includes(language as Language)) return
		setLanguage(language as Language)
	}, [language, setLanguage])
}
