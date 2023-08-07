const { isObject } = require('./checks')

// deepEquals checks whether two objects are equal. It does this iteratively: if the parameters are objects or arrays, these are recursively checked. It tracks references of objects to prevent infinite loops.
function deepEquals(a, b, referenceList = []) {
	// Check reference equality.
	if (a === b)
		return true

	// Check if any of the objects already were in the object list. If so, stop iterating to prevent infinite loops.
	if (isObject(a) && isObject(b)) {
		const aRef = referenceList.find(obj => obj.a === a)?.a
		const bRef = referenceList.find(obj => obj.b === b)?.b
		if (aRef || bRef)
			return (aRef === a && bRef === b) || (aRef === b && bRef === a) // Return true if the references both point to the starting objects.
		referenceList = [...referenceList, { a, b }]
	}

	// Check for arrays.
	if (Array.isArray(a) && Array.isArray(b))
		return a.length === b.length && a.every((value, index) => deepEquals(value, b[index], referenceList))

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
	return keys.every(key => deepEquals(a[key], b[key], referenceList))
}
module.exports.deepEquals = deepEquals
