// isObject checks if a variable is an object.
function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}
module.exports.isObject = isObject

// isPlainObject checks if a variable is a simple object made through {...}. So not one through a constructor with various methods.
function isPlainObject(obj) {
	return isObject(obj) && obj.constructor === Object && obj.$$typeof !== Symbol.for('react.element')
}
module.exports.isPlainObject = isPlainObject

// isEmptyObject checks if the object equals {}.
function isEmptyObject(obj) {
	return isPlainObject(obj) && Object.keys(obj).length === 0
}
module.exports.isEmptyObject = isEmptyObject

// ensureObject makes sure an object is an object and otherwise throws an error.
function ensureObject(obj) {
	if (!isObject(obj))
		throw new Error(`Invalid input: expected an object but received a parameter of type "${typeof obj}".`)
	return obj
}
module.exports.ensureObject = ensureObject

// ensurePlainObject makes sure an object is a plain object and otherwise throws an error.
function ensurePlainObject(obj) {
	if (!isPlainObject(obj))
		throw new Error(`Invalid input: expected a plain object but received a parameter of type "${typeof obj}".`)
	return obj
}
module.exports.ensurePlainObject = ensurePlainObject

// ensureBoolean makes sure a parameter is boolean.
function ensureBoolean(param) {
	if (typeof param !== 'boolean')
		throw new Error(`Invalid input: expected a boolean parameter but received something of type "${typeof param}".`)
	return param
}
module.exports.ensureBoolean = ensureBoolean

// hasIterableParameters is a function that checks if something is an array or plain object: something with parameters that we can browse through.
function hasIterableParameters(obj) {
	return Array.isArray(obj) || isPlainObject(obj)
}
module.exports.hasIterableParameters = hasIterableParameters

// getParentClass takes a class and extracts its parent class.
function getParentClass(cls) {
	return Object.getPrototypeOf(cls)
}
module.exports.getParentClass = getParentClass
