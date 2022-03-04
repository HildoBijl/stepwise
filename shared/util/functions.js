const { ensureInt } = require('./numbers')
const { isBasicObject, applyToEachParameter, ensureConsistency } = require('./objects')

function noop() { }
module.exports.noop = noop

function passOn(x) { return x }
module.exports.passOn = passOn

// repeat will repeat the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. Negative times will throw an error.
function repeat(times, func) {
	repeatWithIndices(0, times - 1, func)
}
module.exports.repeat = repeat

// repeatWithIndices will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithIndices(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown.
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
	arr.forEach((_, index) => func(index + min))
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