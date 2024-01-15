const { isObject, isBasicObject } = require('./checks')
const { deepEquals } = require('./comparisons')
const { keysToObject } = require('./creation')

// setDeepParameter takes an object like { x: { y: 1, z: 2}, w: 3 }, an array of indices ['x', 'z'] and a value (for instance 4) and sets the corresponding value in the object. If the sub-object does not exist, it is created. It changes the 
function setDeepParameter(obj, path, value) {
	if (!Array.isArray(path))
		throw new Error(`Invalid parameter path: expected an array but received a path of type "${typeof path}".`)

	// Create a shallow clone, so as not to adjust the original.
	if (Array.isArray(obj))
		obj = [...obj]
	else if (isBasicObject(obj))
		obj = { ...obj }
	else
		obj = {}

	// Adjust the clone and return it.
	if (path.length === 1)
		obj[path[0]] = value
	else
		obj[path[0]] = (path.length === 1 ? value : setDeepParameter(obj[path[0]], path.slice(1), value))
	return obj
}
module.exports.setDeepParameter = setDeepParameter

// applyMapping takes an object with multiple parameters, like { a: 2, b: 3 }, and applies a function like (x, key) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }. It can also receive an array, in which case it returns an array (just like array map). For objects it filters out undefined. For arrays it does not.
function applyMapping(obj, func) {
	if (Array.isArray(obj))
		return obj.map(func)
	if (isObject(obj))
		return keysToObject(Object.keys(obj), (key, index, resultObject) => func(obj[key], key, resultObject))
	throw new Error(`Invalid applyMapping call: received a call with as input something of type "${typeof obj}". Could not process this. Only objects and arrays are allowed.`)
}
module.exports.applyMapping = applyMapping

// ensureConsistency takes a new value and compares it with the old value. It tries to maintain consistency. If the new value deepEquals the old value, but has a different reference (is cloned/reconstructed) the old value is return, to maintain reference equality. If the value is an object, the process is repeated for its children in an iterative way.
function ensureConsistency(newValue, oldValue) {
	// On a deepEquals, return the old value to keep the reference intact.
	if (deepEquals(newValue, oldValue))
		return oldValue

	// deepEquals gives false. Something is different. For arrays/basic objects try to at least keep child parameters the same.
	if ((Array.isArray(newValue) && Array.isArray(oldValue)) || (isBasicObject(newValue) && isBasicObject(oldValue)))
		return applyMapping(newValue, (parameter, index) => ensureConsistency(parameter, oldValue[index]))

	// For simple parameter types or complex objects there's not much we can do.
	return newValue
}
module.exports.ensureConsistency = ensureConsistency

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

// removeEqualProperties takes two objects and returns a shallow copy of the first one, from which all properties that are equal to the property of the second object have been removed. This is useful if you have an object with settings, and an object with default settings, and you only want to keep the settings not equal to the defaults.
function removeEqualProperties(obj, comparison) {
	return applyMapping(obj, (value, key) => value === comparison[key] ? undefined : value)
}
module.exports.removeEqualProperties = removeEqualProperties
