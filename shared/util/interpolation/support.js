const { isNumber, ensureNumber } = require('../numbers')

// ensureNumberLike checks if a given parameter is either a number or a number-like object with add/subtract/multiply/divide/compare functions and a number property.
function ensureNumberLike(x) {
	// If we do not have an object, then it must be a number. Ensure it is.
	if (typeof x !== 'object')
		return ensureNumber(x)

	// We have an object. Check if it is number-like.
	const functions = ['add', 'subtract', 'multiply', 'divide', 'compare']
	functions.forEach(func => {
		if (typeof x[func] !== 'function')
			throw new Error(`Invalid parameter: expected a number or number-like object. Such a number-like object must have a "${func}" function, but the given parameter does not. Instead, it equals "${JSON.stringify(x)}".`)
	})
	if (x.number === undefined)
		throw new Error(`Invalid parameter: expected a number or number-like object. Such a number-like object must have a "number" property, but the given parameter does not. Instead, it equals "${JSON.stringify(x)}".`)

	// All good! Return the object.
	return x
}
module.exports.ensureNumberLike = ensureNumberLike

// getDefaultInputRange attempts to assemble an input range when no input range is given. This is usually [0, 1], but if the function receives number-like objects then they should be in the same type. To check that, an input value is passed along.
function getDefaultInputRange(inputValue) {
	if (!inputValue || isNumber(inputValue))
		return [0, 1]
	return [inputValue.multiply(0), inputValue.multiply(0).add(1)]
}
module.exports.getDefaultInputRange = getDefaultInputRange

// getInterpolationPart takes an input (for instance 4) and an input range (for instance [2, 10]) and returns the part where the input is on the range (for instance 0.25).
function getInterpolationPart(input, range = getDefaultInputRange(input)) {
	// Ensure the input range is an array with two numbers.
	if (!Array.isArray(range) || range.length !== 2)
		throw new Error(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(range)}".`)
	range = range.map(bound => ensureNumberLike(bound))

	// Ensure that the input is of proper type.
	if (isNumber(input) !== isNumber(range[0]))
		throw new Error(`Invalid interpolation input: the input value must be of the same type as the input range, but this is not the case. The input value is "${input}" but the input range has values like "${range[0]}".`)

	// Calculate the part at which the input is.
	if (isNumber(input))
		return (input - range[0]) / (range[1] - range[0])
	return input.subtract(range[0]).divide(range[1].subtract(range[0]))
}
module.exports.getInterpolationPart = getInterpolationPart

// isValidPart checks if the given part is a valid part: that it is a number between 0 and 1. It may also be a number-like object whose number parameter meets these conditions.
function isValidPart(part) {
	const partNumber = (isNumber(part) ? part : part.number)
	return partNumber >= 0 && partNumber <= 1
}
module.exports.isValidPart = isValidPart

// getClosestIndices takes a value, a function through which values can be extracted from a series, and a series length, and finds the two indices in the series closest to the value. This is done through a binary search. It is assumed (but not checked) that the series is in ascending order.
function getClosestIndices(value, getSeriesValue, seriesLength) {
	let min = 0
	let max = seriesLength - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		const comparisonValue = getSeriesValue(trial)
		if (isNumber(value) ? value < comparisonValue : value.compare(comparisonValue) < 0)
			max = trial
		else
			min = trial
	}
	return [min, max]
}
module.exports.getClosestIndices = getClosestIndices
