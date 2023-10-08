export const languages = ['en', 'nl', 'de']
export const defaultLanguage = 'en'
export const loadPath = (language, path) => `/locales/${language}/${path}.json`
export const updatePath = `http://localhost:4000/locales/update`
export const localStorageKey = 'language' // What key is used to store the language in localStorage?

// countryToLanguage gets an ISO 3166 Alpha-2 country code and turns it into one of the available languages used on the site.
export const countryToLanguage = (country) => {
	// Netherlands, Aruba, Curacao, Saint Martin (Dutch parth), Surinam.
	if (['NL', 'AW', 'CW', 'SX', 'SR'].includes(country))
		return 'nl'

	// Germany, Austria, Switzerland, Liechtenstein.
	if (['DE', 'AT', 'CH', 'LI'].includes(country))
		return 'de'

	// Everything else.
	return defaultLanguage
}
