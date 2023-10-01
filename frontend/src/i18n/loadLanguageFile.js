import { request } from './request'

export function loadLanguageFile(language, path, options = {}) {
	// This function returns a promise waiting for the request.
	return new Promise((resolve, reject) => {
		const url = `/locales/${language}/${path}.json`
		const payload = undefined

		// Set up the callback that deals with the request response.
		const callback = (error, result) => {
			// If there is an error, we can reject right away.
			if (error)
				reject(`Failed loading ${url}: there was an error returned: ${error.message}.`)
			
			// Check the result and its status.
			if (!result)
				reject(`Failed loading ${url}: result parameter was missing.`)
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
