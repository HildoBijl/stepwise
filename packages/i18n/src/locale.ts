// Check whether a string is a valid Unicode locale identifier.
export function isValidLocale(locale: string): boolean {
	if (!locale) return false
	try {
		Intl.getCanonicalLocales(locale)
		return true
	} catch {
		return false
	}
}
