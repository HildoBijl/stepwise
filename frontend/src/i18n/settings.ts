// These settings are only used by the frontend.
export const languages = ['en', 'nl', 'de'] as const
export type Language = typeof languages[number]
export const defaultLanguage: Language = languages[0]
export const localStorageKey = 'language' // What key is used to store the language in localStorage?

// countryToLanguage gets an ISO 3166 Alpha-2 country code and turns it into one of the available languages used on the site.
export const countryToLanguage = (country: string): Language => {
	// Netherlands, Belgium, Aruba, Curacao, Saint Martin (Dutch parth), Surinam.
	if (['NL', 'BE', 'AW', 'CW', 'SX', 'SR'].includes(country))
		return 'nl'

	// Germany, Austria, Switzerland, Liechtenstein.
	if (['DE', 'AT', 'CH', 'LI'].includes(country))
		return 'de'

	// Everything else.
	return defaultLanguage
}
