import { isInt, isNumber } from '../util/numbers'
import { processOptions } from '../util/objects'
export { getRandomInteger } from '../util/random' // Exports this function here too, for uniformity's sake.

// The below default equality options are used when comparing integers through the areNumbersEqual or checkNumberEquality functions.
export const defaultEqualityOptions = {
	absoluteMargin: 0,
	relativeMargin: 0,
	accuracyFactor: 1,
}

// areNumbersEqual does a more thorough number equality check where various options are possible. Note that the numbers may not even need to be integers. If the correct answer is 23.4, then you can give an absoluteMargin of 1 to ensure both 23 and 24 are considered equal.
export function areNumbersEqual(a, b, options = {}) {
	return checkNumberEquality(a, b, options).result
}

// checkNumberEquality does a thorough equality check on the numbers, giving reasons on why they may be unequal.
export function checkNumberEquality(a, b, options = {}) {
	// Check the options.
	options = processOptions(options, defaultEqualityOptions)
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
		result.magnitude = (b < a ? 'TooSmall' : 'TooLarge')
	}

	return result
}

// tex turns a given integer into code for LaTeX.
export function tex(int) {
	return int.toString()
}

// texWithPM will return latex code but then with a plus or minus prior to the number, so it can be used as a term in an equation. For "5" it will return "+5", for "-5" it will return "-5" and for "0" it returns "+0".
export function texWithPM(int) {
	return (int < 0 ? '' : '+') + tex(int)
}

// texWithBrackets will return latex code, but then with brackets if this is a negative number.
export function texWithBrackets(int) {
	return (int < 0 ? `\\left(${tex(int)}\\right)` : tex(int))
}

export function isFOofType(int) {
	return typeof int === 'number' && isInt(int)
}

export function FOtoIO(int) {
	return int.toString()
}

export function IOtoFO(value) {
	if (value === '' || value === '-')
		return 0
	return parseInt(value)
}

export function getEmpty() {
	return ''
}

export function isEmpty(value) {
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}

export function equals(a, b) {
	return IOtoFO(a) === IOtoFO(b)
}
