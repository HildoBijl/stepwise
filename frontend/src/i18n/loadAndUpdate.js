import { loadPath, updatePath } from './settings'
import { request } from './request'
import { ensureLanguage } from './util'

export function loadLanguageFile(language, path, options = {}) {
	language = ensureLanguage(language)
	return new Promise((resolve, reject) => {
		const url = loadPath(language, path)
		const payload = undefined

		// Set up the callback that deals with the request response.
		const callback = (error, result) => {
			// If there is an error, we can reject right away.
			if (error)
				reject(`Failed loading ${url}: an error was returned: ${error.message}.`)
			
			// Check the result and its status.
			if (!result)
				reject(`Failed loading ${url}: no result received.`)
			if (!result.status)
				reject(`Failed loading ${url}: missing status code.`)
			if ((result.status >= 400 && result.status < 600) || !result.status)
				reject(`Failed loading ${url}: status code ${result.status} was given.`)
			
			// All seems to be in order. Try to read the result.
			try {
				resolve(typeof result.data === 'string' ? JSON.parse(result.data) : result.data)
			} catch (error) {
				reject(`Failed loading ${url}: a parse error occurred trying to read the input: ${error.message}.`)
			}
		}

		// Send the request and wait for a response.
		request(url, payload, callback, options)
	})
}

// sendLanguageFileUpdates takes a list of updates [{ language: 'en', path: 'pages/home', entry: 'text.title', translation: 'Welcome to Step-Wise' }, ...] and sends this to the server for updating. It's processed server-side.
export function sendLanguageFileUpdates(updates, options = {}) {
	return new Promise((resolve, reject) => {
		const url = updatePath
		const payload = updates

		// Set up the callback that deals with the request response.
		const callback = (error, result) => {
			// If there is an error, we can reject right away.
			if (error)
				reject(`Failed saving ${url}: an error was returned: ${error.message}.`)
			
			// Check the result and its status.
			if (!result)
				reject(`Failed saving ${url}: no result received.`)
			if (!result.status)
				reject(`Failed saving ${url}: missing status code.`)
			if ((result.status >= 400 && result.status < 600) || !result.status)
				reject(`Failed saving ${url}: status code ${result.status} was given.`)
			
			// All seems to be in order. Try to read the result.
			try {
				resolve(typeof result.data === 'string' ? JSON.parse(result.data) : result.data)
			} catch (error) {
				reject(`Failed saving ${url}: a parse error occurred trying to read the input: ${error.message}.`)
			}
		}

		// Send the request and wait for a response.
		request(url, payload, callback, options)
	})
}
