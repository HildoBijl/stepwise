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

// ensureBasicObject makes sure an object is a basic object and otherwise throws an error.
function ensureBasicObject(obj) {
	if (!isBasicObject(obj))
		throw new Error(`Invalid input: expected a basic object but received a parameter of type "${typeof obj}".`)
	return obj
}
module.exports.ensureBasicObject = ensureBasicObject

// ensureBoolean makes sure a parameter is boolean.
function ensureBoolean(param) {
	if (typeof param !== 'boolean')
		throw new Error(`Invalid input: expected a boolean parameter but received something of type "${typeof param}".`)
	return param
}
module.exports.ensureBoolean = ensureBoolean

// hasIterableParameters is a function that checks if something is an array or basic object: something with parameters that we can browse through.
function hasIterableParameters(obj) {
	return Array.isArray(obj) || isBasicObject(obj)
}
module.exports.hasIterableParameters = hasIterableParameters

// getParentClass takes a class and extracts its parent class.
function getParentClass(cls) {
	return Object.getPrototypeOf(cls)
}
module.exports.getParentClass = getParentClass
