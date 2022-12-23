const { ensureInt } = require('./numbers')
const { isBasicObject, applyToEachParameter, ensureConsistency } = require('./objects')

function noop() { }
module.exports.noop = noop

function passOn(x) { return x }
module.exports.passOn = passOn

function ensureFunction(func) {
	if (typeof func !== 'function')
		throw new Error(`Input error: expected a function but received an input of type "${typeof func}".`)
	return func
}
module.exports.ensureFunction = ensureFunction

// repeat will repeat the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. Negative times will throw an error. Returned is an array of all outcomes.
function repeat(times, func) {
	return repeatWithIndices(0, times - 1, func)
}
module.exports.repeat = repeat

// repeatWithIndices will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithIndices(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown. Returned is an array of all outcomes.
function repeatWithIndices(min, max, func) {
	// Proces input.
	min = ensureInt(min)
	max = ensureInt(max)
	const times = max - min + 1
	if (times < 0)
		throw new Error(`Repeat error: needed to repeat a function a number of ${times} times, but this is impossible.`)
	if (times === 0)
		return

	// Iterate using an impromptu array.
	const arr = (new Array(times)).fill(0)
	return arr.map((_, index) => func(index + min))
}
module.exports.repeatWithIndices = repeatWithIndices

// resolveFunctions takes an array/object (or even a function or basic parameter) and recursively checks if there are functions in it. If so, those functions are executed, with the given parameters. Additionally, undefined values are filtered out.
function resolveFunctions(param, ...args) {
	const resolve = (value) => {
		if (typeof value === 'function')
			return value(...args)
		if (Array.isArray(value) || isBasicObject(value))
			return applyToEachParameter(value, resolve)
		return value
	}
	return ensureConsistency(resolve(param), param)
}
module.exports.resolveFunctions = resolveFunctions