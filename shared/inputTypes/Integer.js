const { isNumber, epsilon } = require('../util/numbers')
const { processOptions } = require('../util/objects')
const { getRandomInteger } = require('../util/random')

module.exports.getRandomInteger = getRandomInteger // Exports this function here too, for uniformity's sake.

// The below default comparison options are used when comparing integers through the areNumbersEqual or checkNumberEquality functions.
const defaultComparison = {
	absoluteMargin: epsilon,
	relativeMargin: epsilon,
	accuracyFactor: 1,
}
module.exports.defaultComparison = defaultComparison

// areNumbersEqual does a more thorough number equality check where various options are possible. Note that the numbers may not even need to be integers. If the correct answer is 23.4, then you can give an absoluteMargin of 1 to ensure both 23 and 24 are considered equal.
function areNumbersEqual(a, b, options = {}) {
	return checkNumberEquality(a, b, options).result
}
module.exports.areNumbersEqual = areNumbersEqual

// checkNumberEquality does a thorough equality check on the numbers, giving reasons on why they may be unequal. Note that the second number (b) is considered a "correct" one and is used as basis for the comparison. The first (a) is considered "input".
function checkNumberEquality(a, b, options = {}) {
	// Check the options.
	options = processOptions(options, defaultComparison)
	if (!isNumber(options.absoluteMargin) || options.absoluteMargin < 0)
		throw new Error(`Invalid options: the parameter absoluteMargin must be a non-negative number but "${options.absoluteMargin}" was given.`)
	if (!isNumber(options.relativeMargin) || options.relativeMargin < 0)
		throw new Error(`Invalid options: the parameter relativeMargin must be a non-negative number, but "${options.relativeMargin}" was given.`)
	if (!isNumber(options.accuracyFactor) || options.accuracyFactor < 0)
		throw new Error(`Invalid options: the parameter accuracyFactor must be a non-negative number, but "${options.accuracyFactor}" was given.`)

	// Check the values, by seeing if one of the given margins matches out.
	const result = { result: true } // Assume equality.
	const absoluteMargin = options.absoluteMargin * options.accuracyFactor
	const relativeMargin = options.relativeMargin * options.accuracyFactor
	if (a >= b - absoluteMargin && a <= b + absoluteMargin) {
		result.absoluteMarginOK = true
		result.magnitude = 'OK'
	} else if (Math.sign(a) === Math.sign(b) && Math.abs(a) >= Math.abs(b) * (1 - relativeMargin) && Math.abs(a) <= Math.abs(b) / (1 - relativeMargin)) {
		result.relativeMarginOK = true
		result.magnitude = 'OK'
	} else { // No equality.
		result.result = false
		result.magnitude = (a < b ? 'TooSmall' : 'TooLarge')
	}

	return result
}
module.exports.checkNumberEquality = checkNumberEquality

// An Integer coming from an input field is stored as a string. In this way we can remember what exactly the user put in. It is transformed into an integer on the SItoFO transformation.

module.exports.SItoFO = (value) => (value === '' || value === '-') ? 0 : parseInt(value)

// Input object legacy: the integer used to be stored inside an object, even for the state. The function below unpacks it. It can be removed once the old exercise data is deleted.
module.exports.SOtoFO = module.exports.SItoFO
