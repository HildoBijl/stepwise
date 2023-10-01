import { addQueryString } from './util'

// Find a Fetch API to use.
let fetchApi
if (typeof fetch === 'function') {
	if (typeof global !== 'undefined' && global.fetch) {
		fetchApi = global.fetch
	} else if (typeof window !== 'undefined' && window.fetch) {
		fetchApi = window.fetch
	} else {
		fetchApi = fetch
	}
}
export { fetchApi }

// fetchUrl takes a clean URL, options and a callback, and calls the Fetch API with it, processing the results.
function fetchUrl(url, fetchOptions, callback) {
	// Set up a resolver to handle the result.
	const resolver = (response) => {
		// If there is an error, no need to unpackage the text. Report the error.
		if (!response.ok)
			return callback(response.statusText || 'Error', { status: response.status })
	
		// Unpackage the text and return it.
		response.text().then((data) => {
			callback(null, { status: response.status, data })
		}).catch(callback)
	}

	// Call the fetch function. Note: react-native debug mode needs the fetch function to be called directly (no alias).
	if (typeof fetch === 'function') {
		fetch(url, fetchOptions).then(resolver).catch(callback)
	} else {
		fetchApi(url, fetchOptions).then(resolver).catch(callback)
	}
}

let omitFetchOptions = false

// requestWithFetch starts the process of requesting a file with Fetch.
export function requestWithFetch(options, url, payload, callback) {
	// Add potential query string parameters to the URL.
	if (options.queryStringParams)
		url = addQueryString(url, options.queryStringParams)
	
	// Set up headers and options.
	const headers = (typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders) || {}
	if (payload)
		headers['Content-Type'] = 'application/json'
	const reqOptions = (typeof options.requestOptions === 'function' ? options.requestOptions(payload) : options.requestOptions)
	const fetchOptions = {
		method: payload ? 'POST' : 'GET',
		body: payload ? JSON.stringify(payload) : undefined,
		headers,
		...(omitFetchOptions ? {} : reqOptions),
	}

	// Try to fetch using the given options. If it fails, try to fix things.
	try {
		fetchUrl(url, fetchOptions, callback)
	} catch (error) {
		// If there were no extra request options, then there's no idea why it doesn't work. Just pass the error.
		if (!reqOptions || Object.keys(reqOptions).length === 0 || !error.message || error.message.indexOf('not implemented') < 0)
			return callback(error)
		
		// Remove the request options and try again. 
		try {
			Object.keys(reqOptions).forEach((key) => {
				delete fetchOptions[key]
			})
			fetchUrl(url, fetchOptions, callback)
			omitFetchOptions = true
		} catch (err) {
			callback(err)
		}
	}
}
