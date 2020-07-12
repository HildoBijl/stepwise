// applyToEachParameter takes an object with multiple parameters, like { a: 2, b: 3}, and applies a function like (x) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }.
function applyToEachParameter(obj, func) {
	const result = {}
	Object.keys(obj).forEach(key => {
		result[key] = func(obj[key])
	})
	return result
}

// objectsEqual checks whether two objects are equal. It does this iteratively: if the parameters are object, these are recursively checked.
function objectsEqual(obj1, obj2) {
	if (!isObject(obj1) || !isObject(obj2))
		return obj1 === obj2
	
	// Check number of keys.
	const keys1 = Object.keys(obj1)
	const keys2 = Object.keys(obj2)
	if (keys1.length !== keys2.length)
		return false
	
	// Merge keys and check new length.
	const keys = [...new Set([...keys1, ...keys2])]
	if (keys.length !== keys1.length)
		return false

	// Walk through keys and check equality.
	if (keys.some(key => !objectsEqual(obj1[key], obj2[key])))
		return false
	return true
}

function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}

module.exports = {
	applyToEachParameter,
	isObject,
	objectsEqual,
}