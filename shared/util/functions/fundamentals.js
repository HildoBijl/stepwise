// noop is a function that does nothing and returns nothing. It's short for "no operation".
function noop() { }
module.exports.noop = noop

// passOn is a function that does nothing but returns the first parameter it receives. (Further parameters are ignored.)
function passOn(x) { return x }
module.exports.passOn = passOn

// ensureFunction checks whether a variable is a function and throws an error if not. If all is fine, the function is returned.
function ensureFunction(func) {
	if (typeof func !== 'function')
		throw new Error(`Input error: expected a function but received an input of type "${typeof func}".`)
	return func
}
module.exports.ensureFunction = ensureFunction
