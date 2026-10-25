// Which languages are there?
export const languages = ['en', 'nl', 'de'] as const
export type Language = typeof languages[number]
export const defaultLanguage: Language = languages[0]

// How do we store this within localStorage?
export const localStorageKey = 'language'

// Helper to determine the country from locale settings.
export const countryToLanguage = (country: string): Language => {
	if (['NL', 'BE', 'AW', 'CW', 'SX', 'SR'].includes(country)) return 'nl'
	if (['DE', 'AT', 'CH', 'LI'].includes(country)) return 'de'
	return defaultLanguage
}
