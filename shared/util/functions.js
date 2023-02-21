const { ensureInt } = require('./numbers')
const { ensureNumberArray } = require('./arrays')
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
	return repeatWithMinMax(0, times - 1, func)
}
module.exports.repeat = repeat

// repeatWithMinMax will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithMinMax(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown. Returned is an array of all outcomes.
function repeatWithMinMax(min, max, func) {
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
module.exports.repeatWithMinMax = repeatWithMinMax

// repeatMultidimensional takes an array of maximum values (for instance [3,2]) and calls the given function for all possible permutations of numbers underneath those maximum values. So it calls f(0,0), f(0,1), f(1,0), f(1,1), f(2,0) and f(2,1). Returned is a multi-dimensional array of all outcomes.
function repeatMultidimensional(times, func) {
	times = ensureNumberArray(times)
	return repeatMultidimensionalWithMinMax(times.map(num => 0), times.map(num => num - 1), func)
}
module.exports.repeatMultidimensional = repeatMultidimensional

// repeatMultidimensionalWithMinMax will repeat the given function with indices ranging from min to max (both inclusive). This is done in a multi-dimensional way.
function repeatMultidimensionalWithMinMax(min, max, func, previousValues = []) {
	min = ensureNumberArray(min)
	max = ensureNumberArray(max)
	if (min.length !== max.length)
		throw new Error(`Invalid min and max matrices: the minimum and maximum values of repeatMultidimensional must have the same number of elements. This is not the case: min has ${min.length} and max has ${max.length} elements.`)

	// Check the final case.
	if (min.length === 0)
		return func(...previousValues)

	// Recursively walk through the permutations.
	const minValue = ensureInt(min[0])
	const maxValue = ensureInt(max[0])
	return repeatWithMinMax(minValue, maxValue, value => repeatMultidimensionalWithMinMax(min.slice(1), max.slice(1), func, [...previousValues, value]))
}
module.exports.repeatMultidimensionalWithMinMax = repeatMultidimensionalWithMinMax

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
