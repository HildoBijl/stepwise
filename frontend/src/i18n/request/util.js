export function addQueryString(url, params) {
	// If parameters have been given, set up a query string.
	if (params && typeof params === 'object') {
		let queryString = ''
		for (const paramName in params)
			queryString += '&' + encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName])

		// Add the query string to the URL. Do check if there already is part of a query sting present.
		if (queryString)
			url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1)
	}

	// All done!
	return url
}
