const { ensureString } = require('./strings')

// isObject checks if a variable is an object.
function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}
module.exports.isObject = isObject

// ensureObject makes sure an object is an object and otherwise throws an error.
function ensureObject(obj) {
	if (!isObject(obj))
		throw new Error(`Invalid input: expected an object but received a parameter of type "${typeof obj}".`)
	return obj
}
module.exports.ensureObject = ensureObject

// ensureBoolean makes sure a parameter is boolean.
function ensureBoolean(param) {
	if (typeof param !== 'boolean')
		throw new Error(`Invalid input: expected a boolean parameter but received something of type "${typeof param}".`)
	return param
}
module.exports.ensureBoolean = ensureBoolean

// deepEquals checks whether two objects are equal. It does this iteratively: if the parameters are objects or arrays, these are recursively checked.
function deepEquals(a, b) {
	// Check reference equality.
	if (a === b)
		return true

	// Check for arrays.
	if (Array.isArray(a) && Array.isArray(b))
		return a.length === b.length && a.every((val, index) => deepEquals(val, b[index]))

	// Check for non-object types.
	if (!isObject(a) || !isObject(b))
		return a === b

	// Check number of keys.
	const keys1 = Object.keys(a)
	const keys2 = Object.keys(b)
	if (keys1.length !== keys2.length)
		return false

	// Merge keys and check new length.
	const keys = [...new Set([...keys1, ...keys2])]
	if (keys.length !== keys1.length)
		return false

	// Walk through keys and check equality.
	return keys.every(key => deepEquals(a[key], b[key]))
}
module.exports.deepEquals = deepEquals

// ensureConsistency takes a new value and compares it with the old value. It tries to maintain consistency. If the new value deepEquals the old value, but has a different reference (is cloned/reconstructed) the old value is return, to maintain reference equality. If the value is an object, the process is repeated for its children in an iterative way.
function ensureConsistency(newValue, oldValue) {
	// On a deepEquals, return the old value to keep the reference intact.
	if (deepEquals(newValue, oldValue))
		return oldValue

	// There is no deepEquals. Walk through the object to see if children can be kept consistent. First check for arrays.
	if (Array.isArray(newValue)) {
		if (Array.isArray(oldValue))
			return newValue.map((item, index) => ensureConsistency(item, oldValue[index]))
		return newValue
	}

	// Then check for non-objects. For non-objects there's no such thing as reference inequality, so just return the value.
	if (!isObject(newValue) || !isObject(oldValue))
		return newValue

	// We have an object. Assemble the new object.
	const newObject = {}
	Object.keys(newValue).forEach(key => {
		newObject[key] = ensureConsistency(newValue[key], oldValue[key])
	})
	return newObject
}
module.exports.ensureConsistency = ensureConsistency

// applyToEachParameter takes an object with multiple parameters, like { a: 2, b: 3 }, and applies a function like (x) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }.
function applyToEachParameter(obj, func) {
	const result = {}
	Object.keys(obj).forEach(key => {
		result[key] = func(obj[key])
	})
	return result
}
module.exports.applyToEachParameter = applyToEachParameter

// processOptions is used to process an options object given to a function. It adds the given default options and checks if no non-existing options have been given. It returns a copy.
function processOptions(givenOptions, defaultOptions) {
	// Check if the default options were given.
	if (!defaultOptions || typeof defaultOptions !== 'object')
		throw new Error(`Invalid defaultOptions: no or an invalid defaultOptions object was given.`)

	// Check if the options are in the proper format.
	if (typeof givenOptions !== 'object')
		throw new Error(`Invalid options: the options object must be an object, but it had type "${typeof givenOptions}".`)

	// Check if there are no non-existent options.
	Object.keys(givenOptions).forEach(key => {
		if (!defaultOptions.hasOwnProperty(key))
			throw new Error(`Invalid option: an option "${key}" was given, but this was not among the available options.`)
	})

	// Merge the defaults with the given options.
	return { ...defaultOptions, ...givenOptions }
}
module.exports.processOptions = processOptions

// filterOptions takes two options objects and filters the properties of the first based on what's in the second. This is useful if only some of the properties need to be passed on to a child object.
function filterOptions(allOptions, allowedOptions) {
	return filterProperties(allOptions, Object.keys(allowedOptions))
}
module.exports.filterOptions = filterOptions

// filterProperties filters the properties of an object based on the given arrays of keys. Only properties that are in the given array will be kept, and others will be removed. The original object is not adjusted: a new object is returned.
function filterProperties(obj, allowedKeys) {
	const res = {}
	allowedKeys.forEach(key => {
		if (obj[key] !== undefined)
			res[key] = obj[key]
	})
	return res
}
module.exports.filterProperties = filterProperties

// removeProperties removes the properties of an object given by an array of keys. All other properties are kept. The original object is not adjusted: a new object is returned.
function removeProperties(obj, keysToRemove) {
	keysToRemove = Array.isArray(keysToRemove) ? keysToRemove : [keysToRemove]
	const res = { ...obj }
	keysToRemove.forEach(key => {
		delete res[key]
	})
	return res
}
module.exports.removeProperties = removeProperties

// getParentClass takes a class and extracts its parent class.
function getParentClass(cls) {
	return Object.getPrototypeOf(cls)
}
module.exports.getParentClass = getParentClass

// getPropertyOrDefault takes an object and returns a property of it if it exists. If not, it checks if default exists, assuming useDefaultAsFallback is set to true (default). If neither exists, possibly the object itself is given (default: false), or possibly an error is thrown (default: false), depending on the settings.
function getPropertyOrDefault(obj, prop, useDefaultAsFallback = true, useSelfAsFallback = false, throwErrorOnMissing = false, errorMessage) {
	prop = ensureString(prop)
	if (!obj)
		return undefined
	if (obj[prop])
		return obj[prop]
	if (useDefaultAsFallback && obj.default)
		return obj.default
	if (useSelfAsFallback)
		return obj
	if (throwErrorOnMissing)
		throw new Error(errorMessage || `Missing object property: could not find property "${prop}".`)
}
module.exports.getPropertyOrDefault = getPropertyOrDefault