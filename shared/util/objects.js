// isObject checks if a variable is an object.
function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}
module.exports.isObject = isObject

// deepEquals checks whether two objects are equal. It does this iteratively: if the parameters are objects or arrays, these are recursively checked.
function deepEquals(a, b) {
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

// applyToEachParameter takes an object with multiple parameters, like { a: 2, b: 3 }, and applies a function like (x) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }.
function applyToEachParameter(obj, func) {
	const result = {}
	Object.keys(obj).forEach(key => {
		result[key] = func(obj[key])
	})
	return result
}
module.exports.applyToEachParameter = applyToEachParameter

// processOptions is used to process an options object given to a function. It adds the given default options and checks if no non-existing options have been given.
function processOptions(givenOptions, defaultOptions) {
	// Check if the options are in the proper format.
	if (typeof givenOptions !== 'object')
		throw new Error(`Invalid options: the options object must be an object, but it had type "${typeof options}".`)

	// Check if there are no non-existent options.
	Object.keys(givenOptions).forEach(key => {
		if (!defaultOptions.hasOwnProperty(key))
			throw new Error(`Invalid option: an option "${key}" was given, but this was not among the available options.`)
	})

	// Merge the defaults with the given options.
	return { ...defaultOptions, ...givenOptions }
}
module.exports.processOptions = processOptions