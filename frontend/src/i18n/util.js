import { ensureString } from 'step-wise/util'

import { languages } from './settings'

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
