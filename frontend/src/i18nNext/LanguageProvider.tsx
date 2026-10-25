import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { type CatalogLoader, I18nProvider, type SourceRegistrar } from '@step-wise/i18n'

import { countryToLanguage, defaultLanguage, type Language, languages, localStorageKey } from './settings.ts'
import { loadCatalog as defaultCatalogLoader } from './loadCatalog.ts'
import { registerSource as defaultSourceRegistrar } from './registerSource.ts'

type LanguageContextValue = {
	language: Language
	setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export type LanguageProviderProps = {
	children: ReactNode
	loadCatalog?: CatalogLoader
	registerSource?: SourceRegistrar
}

// Set up a provider that allows to set the language.
export function LanguageProvider({ children, loadCatalog = defaultCatalogLoader, registerSource = defaultSourceRegistrar }: LanguageProviderProps) {
	// Set up a state for the language.
	const [language, setLanguageState] = useState<Language>(() => getStoredLanguage() ?? defaultLanguage)
	const setLanguage = useCallback((nextLanguage: Language) => {
		if (!languages.includes(nextLanguage)) throw new Error(`Unsupported language: ${nextLanguage}`)
		setLanguageState(nextLanguage)
		localStorage.setItem(localStorageKey, nextLanguage)
	}, [])

	// Upon page start-up, try to determine the language.
	useEffect(() => {
		if (getStoredLanguage()) return
		const controller = new AbortController()
		void getLocationBasedLanguage(controller.signal).then(locationLanguage => {
			if (locationLanguage) setLanguage(locationLanguage)
		}).catch(error => {
			if (error.name !== 'AbortError') console.warn('Could not determine a location-based language.', error)
		})
		return () => controller.abort()
	}, [setLanguage])

	// Set up the provider with the language settings, and include the i18nProvider loading the language files.
	return <LanguageContext.Provider value={{ language, setLanguage }}>
		<I18nProvider locale={language} sourceLocale={defaultLanguage} loadCatalog={loadCatalog} {...registerSource ? { registerSource } : {}}>
			{children}
		</I18nProvider>
	</LanguageContext.Provider>
}

export function useLanguage(): Language {
	const context = useContext(LanguageContext)
	if (!context) throw new Error('useLanguage must be used within a LanguageProvider.')
	return context.language
}

export function useSetLanguage(): (language: Language) => void {
	const context = useContext(LanguageContext)
	if (!context) throw new Error('useSetLanguage must be used within a LanguageProvider.')
	return context.setLanguage
}

export function useLanguageSetting(language: string | undefined): void {
	const setLanguage = useSetLanguage()
	useEffect(() => {
		if (!languages.includes(language as Language)) return
		setLanguage(language as Language)
	}, [language, setLanguage])
}

function getStoredLanguage(): Language | undefined {
	const language = localStorage.getItem(localStorageKey)
	return languages.includes(language as Language) ? language as Language : undefined
}

async function getLocationBasedLanguage(signal: AbortSignal): Promise<Language | undefined> {
	const response = await fetch('https://ipinfo.io/json?token=7d5a45b4af74c3', { signal })
	if (!response.ok) return undefined
	const { country } = await response.json() as { country?: string }
	return country ? countryToLanguage(country) : undefined
}
