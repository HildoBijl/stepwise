const { ensureNumber, roundTo, getRandomNumber } = require('../../util')

const { Float } = require('./Float')

/* getRandomFloat returns a random float between the given min and max, according to a uniform distribution. You can either set:
 * - the number of decimals through "decimals". Use "1" for "23.4" and "-1" for "2.34 * 10^3".
 * - the number of significant digits through "significantDigits". Use "3" for "23.4" and "2.34 * 10^3".
 * If none is given then infinite precision will be assumed.
 * If round is true (default true) the number will be rounded to be precisely "23.4" and not be "23.4321" or so behind the scenes.
 * If prevent is given a value (or array of values) then those numbers (regular floats like "0.5") are excluded. Do note that, if all possible numbers are prevented, this will result in an infinite loop.
 */
function getRandomFloat(options) {
	// Check input: must be numbers.
	let { min, max } = options
	min = ensureNumber(min)
	max = ensureNumber(max)

	// Set up a random float.
	const number = getRandomNumber(min, max)
	const result = processFloat(number, options)

	// Check if it's in the prevent list.
	if (options.prevent !== undefined) {
		const prevent = Array.isArray(options.prevent) ? options.prevent : [options.prevent]
		if (prevent.includes(result.number))
			return getRandomFloat(options)
	}

	// All good!
	return result
}
module.exports.getRandomFloat = getRandomFloat

// getRandomExponentialFloat returns a random float between the given min and max. It does this according to an exponential distribution to satisfy Benford's law. Optionally, "negative" can be set to true to force a negative sign, or otherwise "randomSign" can be set to true to also get negative numbers. A "prevent" option can be given to prevent certain float numbers.
function getRandomExponentialFloat(options) {
	// Check input: must be nonzero positive numbers.
	let { min, max, negative, randomSign } = options
	min = ensureNumber(min, true, true)
	max = ensureNumber(max, true, true)

	// Set up a random float.
	const randomExp = getRandomNumber(Math.log10(min), Math.log10(max))
	const sign = (negative || (randomSign && Math.random() < 0.5)) ? -1 : 1
	const number = sign * Math.pow(10, randomExp)
	const result = processFloat(number, options)

	// Check if it's in the prevent list.
	if (options.prevent !== undefined) {
		const prevent = Array.isArray(options.prevent) ? options.prevent : [options.prevent]
		if (prevent.includes(result.number))
			return getRandomExponentialFloat(options)
	}

	// All good!
	return result
}
module.exports.getRandomExponentialFloat = getRandomExponentialFloat

// processFloat turns the given number with the corresponding options into a Float object.
function processFloat(number, { decimals, significantDigits, round = true }) {
	// Check input.
	if (decimals !== undefined && significantDigits !== undefined)
		throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)

	// Determine the number and set its precision accordingly.
	let float
	if (decimals !== undefined) {
		number = round ? roundTo(number, decimals) : number
		float = new Float({ number, significantDigits: Math.max(Math.floor(Math.log10(Math.abs(number))) + 1 + decimals, 0) })
	} else if (significantDigits !== undefined) {
		float = new Float({ number, significantDigits })
	} else {
		float = new Float({ number, significantDigits: Infinity })
	}
	if (round)
		float = float.roundToPrecision()
	return float
}
