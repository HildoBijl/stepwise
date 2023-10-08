import { ensureString } from 'step-wise/util'

import { languages, localStorageKey, countryToLanguage } from './settings'

export function pathAsArray(path) {
	return Array.isArray(path) ? path : path.split('/')
}

export function pathAsString(path) {
	return Array.isArray(path) ? path.join('/') : path
}

export function entryAsArray(entry) {
	return Array.isArray(entry) ? entry : entry.split('.')
}

export function entryAsString(entry) {
	return Array.isArray(entry) ? entry.join('.') : entry
}

export function ensureLanguage(language) {
	language = ensureString(language).toLowerCase()
	if (!languages.includes(language))
		throw new Error(`Invalid language: tried to process a language "${language}" but this was not among the available languages.`)
	return language
}

// getStoredLanguage will get a language setting from localStorage.
export function getStoredLanguage() {
	return localStorage.getItem(localStorageKey)
}

// setStoredLanguage will store a language setting in localStorage. Note that it does not change the language within the website: call setLanguage separately.
export function setStoredLanguage(language) {
	if (languages.includes(language))
		localStorage.setItem(localStorageKey, language)
}

// getLocationBasedLanguage takes the user's IP, asks the IP-Info server about the country to which this IP is registered at, and then based on that determines the language the user should have.
export async function getLocationBasedLanguage() {
	// Fetch data from the IP Info API.
	const ipInfoResponse = await fetch('https://ipinfo.io/json?token=7d5a45b4af74c3')
	if (!ipInfoResponse.ok)
		return undefined

	// Get the payload, extract the country and turn it into a language.
	const ipInfo = await ipInfoResponse.json()
	const { country } = ipInfo
	return country && countryToLanguage(ipInfo.country)
}
