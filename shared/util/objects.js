const { ensureString } = require('./strings')

// isObject checks if a variable is an object.
function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}
module.exports.isObject = isObject

// isBasicObject checks if a variable is a simple object made through {...}. So not one through a constructor with various methods.
function isBasicObject(obj) {
	return isObject(obj) && obj.constructor === Object
}
module.exports.isBasicObject = isBasicObject

// isEmptyObject checks if the object equals {}.
function isEmptyObject(obj) {
	return isBasicObject(obj) && Object.keys(obj).length === 0
}
module.exports.isEmptyObject = isEmptyObject

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
		return a.length === b.length && a.every((value, index) => deepEquals(value, b[index]))

	// Check for non-object types.
	if (!isObject(a) || !isObject(b))
		return a === b

	// Check constructor.
	if (a.constructor !== b.constructor)
		return false

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

	// deepEquals gives false. Something is different. For arrays/basic objects try to at least keep child parameters the same.
	if ((Array.isArray(newValue) && Array.isArray(oldValue)) || (isBasicObject(newValue) && isBasicObject(oldValue)))
		return applyToEachParameter(newValue, (parameter, index) => ensureConsistency(parameter, oldValue[index]))

	// For simple parameter types or complex objects there's not much we can do.
	return newValue
}
module.exports.ensureConsistency = ensureConsistency

// applyToEachParameter takes an object with multiple parameters, like { a: 2, b: 3 }, and applies a function like (x, key) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }. It can also receive an array, in which case it returns an array (just like array map). In both cases undefined values are always filtered out.
function applyToEachParameter(obj, func) {
	if (Array.isArray(obj))
		return obj.map(func).filter(value => value !== undefined)
	if (isObject(obj))
		return keysToObject(Object.keys(obj), (key, index, resultObject) => func(obj[key], key, resultObject))
	throw new Error(`Invalid applyToEachParameter call: received a call with as input something of type "${typeof obj}". Could not process this. Only objects and arrays are allowed.`)
}
module.exports.applyToEachParameter = applyToEachParameter

// keysToObject takes an array of keys like ['num', 'den'] and applies a function func(key, index, resultObject) for each of these keys. The result is stored in an object like { num: func('num'), den: func('den') }. If the result is undefined, it is not stored in the object.
function keysToObject(keys, func) {
	const result = {}
	keys.forEach((key, index) => {
		const funcResult = func(key, index, result)
		if (funcResult !== undefined)
			result[key] = funcResult
	})
	return result
}
module.exports.keysToObject = keysToObject

// arraysToObject takes two arrays of equal length, one with keys and the other with values, and turns it into a basic object.
function arraysToObject(keys, values) {
	return keysToObject(keys, (_, index) => values[index])
}
module.exports.arraysToObject = arraysToObject

// processOptions is used to process an options object given to a function. It adds the given default options and checks if no non-existing options have been given. On a non-existing option it throws an error, unless filterStrangers is set to true, in which case these options are merely removed. The result is a copied object: original objects are not altered.
function processOptions(givenOptions, defaultOptions, filterStrangers = false) {
	// Check if the default options were given.
	if (!defaultOptions || typeof defaultOptions !== 'object')
		throw new Error(`Invalid defaultOptions: no or an invalid defaultOptions object was given.`)

	// Check if the options are in the proper format.
	if (typeof givenOptions !== 'object')
		throw new Error(`Invalid options: the options object must be an object, but it had type "${typeof givenOptions}".`)

	// Check if there are no non-existent options.
	if (filterStrangers) {
		givenOptions = filterOptions(givenOptions, defaultOptions)
	} else {
		Object.keys(givenOptions).forEach(key => {
			if (!defaultOptions.hasOwnProperty(key))
				throw new Error(`Invalid option: an option "${key}" was given, but this was not among the available options.`)
		})
	}

	// Add all defaults on top of the given option.
	const result = { ...givenOptions }
	Object.keys(defaultOptions).forEach(key => {
		if (givenOptions[key] === undefined && defaultOptions[key] !== undefined)
			result[key] = defaultOptions[key]
	})
	return result
}
module.exports.processOptions = processOptions

// filterOptions takes two options objects and filters the properties of the first based on what's in the second. This is useful if only some of the properties need to be passed on to a child object.
function filterOptions(allOptions, allowedOptions, removeUndefined) {
	return filterProperties(allOptions, Object.keys(allowedOptions), removeUndefined)
}
module.exports.filterOptions = filterOptions

// filterProperties filters the properties of an object based on the given arrays of keys. Only properties that are in the given array will be kept, and others will be removed. The original object is not adjusted: a new object is returned.
function filterProperties(obj, allowedKeys, removeUndefined = true) {
	const res = {}
	allowedKeys.forEach(key => {
		if (!removeUndefined || obj[key] !== undefined)
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

// removeEqualProperties takes two objects and returns a shallow copy of the first one, from which all properties that are equal to the property of the second object have been removed.
function removeEqualProperties(obj, comparison) {
	return applyToEachParameter(obj, (value, key) => value === comparison[key] ? undefined : value)
}
module.exports.removeEqualProperties = removeEqualProperties

// getParentClass takes a class and extracts its parent class.
function getParentClass(cls) {
	return Object.getPrototypeOf(cls)
}
module.exports.getParentClass = getParentClass

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
