import { processOptions } from 'step-wise/util'

import { fetchApi, requestWithFetch } from './fetch'
import { hasXmlHttpRequest, requestWithXmlHttpRequest } from './xmlHttpRequest'

const defaultOptions = {
	customHeaders: {},
	queryStringParams: {},
	crossDomain: false, // Used for XmlHttpRequest.
	withCredentials: false, // Used for XmlHttpRequest.
	overrideMimeType: false, // Used for XmlHttpRequest.
	requestOptions: { // Used for fetch.
		mode: 'cors',
		credentials: 'same-origin',
		cache: 'default'
	},
}

export function request(url, payload, callback, options = {}) {
	// Process input parameters: if no payload is present, the callback may be given at the location of the payload.
	options = processOptions(options, defaultOptions)
  if (typeof payload === 'function') {
    callback = payload
    payload = undefined
  }
  callback = callback || (() => {})

	// If the Fetch API is present, use it.
  if (fetchApi && url.indexOf('file:') !== 0)
    return requestWithFetch(options, url, payload, callback)

	// If an XML HTTP Request is possible, use that instead.
  if (hasXmlHttpRequest() || typeof ActiveXObject === 'function')
    return requestWithXmlHttpRequest(options, url, payload, callback)

	// Note that there is no way of retrieving the data.
  callback(new Error('Invalid request call: no fetch and no XHR implementation is present. There is no way of loading the external resources.'))
}
