const { ensureInt } = require('../numbers')
const { ensureNumberArray } = require('../arrays')

// repeat will repeat the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. Using a negative times will throw an error. Returned is an array of all outcomes.
function repeat(times, func) {
	times = ensureInt(times, true)
	return repeatWithMinMax(0, times - 1, func)
}
module.exports.repeat = repeat

// repeatWithMinMax will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithMinMax(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown. Returned is an array of all outcomes. If no function but a value is given, that value is repeated as is.
function repeatWithMinMax(min, max, func) {
	// Process input.
	min = ensureInt(min)
	max = ensureInt(max)
	const times = max - min + 1
	if (times < 0)
		throw new Error(`Repeat error: needed to repeat a function a number of ${times} times, but this is impossible.`)
	if (times === 0)
		return
	const processedFunc = (typeof func === 'function' ? func : () => func)

	// Iterate using an impromptu array.
	const arr = (new Array(times)).fill(0)
	return arr.map((_, index) => processedFunc(index + min))
}
module.exports.repeatWithMinMax = repeatWithMinMax

// repeatMultidimensional takes an array of maximum values (for instance [3,2]) and calls the given function for all possible permutations of numbers underneath those maximum values. So it calls f(0,0), f(0,1), f(1,0), f(1,1), f(2,0) and f(2,1). Returned is a multi-dimensional array of all outcomes.
function repeatMultidimensional(times, func) {
	times = ensureNumberArray(times)
	return repeatMultidimensionalWithMinMax(times.map(() => 0), times.map(num => num - 1), func)
}
module.exports.repeatMultidimensional = repeatMultidimensional

// repeatMultidimensionalWithMinMax will repeat the given function with indices ranging from min to max (both inclusive). So for instance it can be called with min: [3, 8] and max: [5, 9], in which case we get as outcome an array [[f(3,8), f(3,9)], [f(4,8), f(4,9)], [f(5,8), f(5,9)]]
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
