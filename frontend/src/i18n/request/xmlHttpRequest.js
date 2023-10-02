import { addQueryString } from './util'

// hasXMLHttpRequest checks if the XML HTTP Request can be used.
export function hasXmlHttpRequest() {
	return (typeof XMLHttpRequest === 'function' || typeof XMLHttpRequest === 'object')
}

// Try to find the XML HTTP Request API.
let XmlHttpRequestApi
if (hasXmlHttpRequest()) {
  if (typeof global !== 'undefined' && global.XMLHttpRequest) {
    XmlHttpRequestApi = global.XMLHttpRequest
  } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    XmlHttpRequestApi = window.XMLHttpRequest
  }
}

// Try to find the ActiveX Object API.
let ActiveXObjectApi
if (typeof ActiveXObject === 'function') {
  if (typeof global !== 'undefined' && global.ActiveXObject) {
    ActiveXObjectApi = global.ActiveXObject
  } else if (typeof window !== 'undefined' && window.ActiveXObject) {
    ActiveXObjectApi = window.ActiveXObject
  }
}

// requestWithXmlHttpRequest starts the process of requesting a file with an XML HTTP Request.
export function requestWithXmlHttpRequest(options, url, payload, callback) {
	// Process the payload. It must be in query-string format.
  if (payload && typeof payload === 'object')
    payload = addQueryString('', payload).slice(1)

	// Add potential query string parameters to the URL.
  if (options.queryStringParams)
    url = addQueryString(url, options.queryStringParams)

	// Try to request the file.
  try {
		// Set up the connection.
    let req
    if (XmlHttpRequestApi) {
      req = new XmlHttpRequestApi()
    } else {
      req = new ActiveXObjectApi('MSXML2.XMLHTTP.3.0')
    }
    req.open(payload ? 'POST' : 'GET', url, 1)

		// Set up the right headers.
    if (!options.crossDomain) {
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    }
    req.withCredentials = !!options.withCredentials
    if (payload) {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    if (req.overrideMimeType) {
      req.overrideMimeType('application/json')
    }

		// Add in extra custom headers.
    let headers = options.customHeaders
    headers = typeof headers === 'function' ? headers() : headers
    if (headers) {
      for (const header in headers) {
        req.setRequestHeader(header, headers[header])
      }
    }

		// On an update, check if we're done, and if so call the callback function.
    req.onreadystatechange = () => {
      req.readyState > 3 && callback(req.status >= 400 ? req.statusText : null, { status: req.status, data: req.responseText })
    }

		// Time to send the payload!
    req.send(payload)
  } catch (error) {
    console && console.error(error)
  }
}
