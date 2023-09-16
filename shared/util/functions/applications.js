const { isBasicObject, applyMapping, ensureConsistency } = require('../objects')

// resolveFunctions takes an array/object (or even a function or basic parameter) and recursively checks if there are functions in it. If so, those functions are executed with the given parameters. Additionally, undefined values are filtered out.
function resolveFunctions(param, ...args) {
	const resolve = (value) => {
		if (typeof value === 'function')
			return value(...args)
		if (Array.isArray(value) || isBasicObject(value))
			return applyMapping(value, resolve)
		return value
	}
	return ensureConsistency(resolve(param), param)
}
module.exports.resolveFunctions = resolveFunctions

// resolveFunctionsShallow is like resolveFunctions but then does not iterate inside of an array/object.
function resolveFunctionsShallow(param, ...args) {
	return (typeof param === 'function' ? param(...args) : param)
}
module.exports.resolveFunctionsShallow = resolveFunctionsShallow

// joinFunctions takes multiple functions and creates a new function that (when called) calls all of them with the same input. The return value is an array of the resulting function return values.
function joinFunctions(...funcs) {
	// Ensure that we have an array of functions.
	funcs = funcs.filter(func => func !== undefined)
	if (funcs.some(func => (typeof func !== 'function')))
		throw new Error(`Invalid join function call: tried to join functions, but received something that was not a function.`)

	// Set up a joint function.
	return (...args) => funcs.map(func => func(...args))
}
module.exports.joinFunctions = joinFunctions
