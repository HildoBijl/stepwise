const { ensureString } = require('../strings')

// getPropertyOrDefault takes an object and returns a property of it if it exists. If not, it checks if default exists, assuming useDefaultAsFallback is set to true (default). If neither exists, possibly the object itself is given (default: false), or possibly an error is thrown (default: false), depending on the settings.
function getPropertyOrDefault(obj, prop, useDefaultAsFallback = true, useSelfAsFallback = false, throwErrorOnMissing = false, errorMessage) {
	prop = ensureString(prop)
	if (obj === undefined)
		return undefined
	if (obj && obj[prop] !== undefined)
		return obj[prop]
	if (useDefaultAsFallback && obj && obj.default !== undefined)
		return obj.default
	if (useSelfAsFallback)
		return obj
	if (throwErrorOnMissing)
		throw new Error(errorMessage || `Missing object property: could not find property "${prop}".`)
}
module.exports.getPropertyOrDefault = getPropertyOrDefault

// JSONstringifyWithoutPropertyQuotes will JSON stringify an object but not like {"x":"a"}. Instead, it will give {x:"a"}. No quotes will be used around properties.
function JSONstringifyWithoutPropertyQuotes(obj) {
	// If it's not an object, use the regular JSON.stringify.
	if (typeof obj !== "object" || Array.isArray(obj))
		return JSON.stringify(obj)

	// Merge all properties together into a JSON string.
	return `{${Object.keys(obj).map(key => `${key}:${JSONstringifyWithoutPropertyQuotes(obj[key])}`).join(',')}}`
}
module.exports.JSONstringifyWithoutPropertyQuotes = JSONstringifyWithoutPropertyQuotes
