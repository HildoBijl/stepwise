// Define regular expressions for various parts of a Float number.
const numberFormat = '(-?((\\d+[.,]?\\d*)|(\\d*[.,]?\\d+)))'
const timesFormat = '(\\s*\\*\\s*)'
// const tenPowerFormat = '10\\^(?:(?:\\((?<powerWithBrackets>-?\\d+)\\))|(?<powerWithoutBrackets>-?\\d+))' // Firefox doesn't support named capture groups.
const tenPowerFormat = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
const floatFormat = `(${numberFormat}${timesFormat}${tenPowerFormat}|${tenPowerFormat}|${numberFormat})` // Either a number, or a ten-power, or both with a multiplication in-between. (In reverse order, having more complex first)
module.exports.numberFormat = numberFormat
module.exports.floatFormat = floatFormat

const regNumberFormat = new RegExp(`^${numberFormat}$`)
// const regTenPowerFormat = new RegExp(`^${tenPowerFormat}$`)
const regFloatFormat = new RegExp(`^${floatFormat}$`)

// stringToSO turns a string into a storage object that can be interpreted.
function stringToSO(str) {
	// Check boundary cases.
	str = str.trim()
	if (str === '')
		return {}

	// Check the format.
	const match = regFloatFormat.exec(str)
	if (!match)
		throw new Error(`Invalid Float number given: could not parse "${str}". It did not have the required format of "xxx.xxxx * 10^(yy)", or alternatively just "xxx.xxxx" or "10^(yy)". (Brackets are also optional.)`)

	// Extract number data and return it.
	const numberStr = (match[2] || match[17] || '').replace(',', '.') // Turn a comma into a period. (Dutch vs US formatting.)
	const power = parseInt(match[10] || match[11] || match[15] || match[16] || 0)

	// Check a special case: no number string.
	if (numberStr === '')
		return {
			number: Math.pow(10, power),
			significantDigits: Infinity,
			power,
		}

	// Default case: assemble the SO.
	return {
		number: parseFloat(numberStr) * Math.pow(10, power),
		significantDigits: getSignificantDigits(numberStr),
		power,
	}
}
module.exports.stringToSO = stringToSO

// numberToSO turns a number into a storage object that can be interpreted. We always assume that numbers are infinitely precise.
function numberToSO(number) {
	return {
		number,
		significantDigits: Infinity,
	}
}
module.exports.numberToSO = numberToSO

// getSignificantDigits returns the number of significant digits that a number in string format has.
function getSignificantDigits(str) {
	// Check input.
	if (typeof str !== 'string')
		throw new Error(`Invalid input: expected a string but received an input parameter of type "${typeof str}".`)
	if (!regNumberFormat.exec(str))
		throw new Error(`Invalid input: tried to get the number of significant digits from a string, but received a non-numeric string "${str}".`)

	// Check boundary cases.
	const strAsArray = str.replace(/[,.-]+/g, '').split('')
	if (strAsArray.every(x => (x === '0' || x === '.'))) // Only zeros or dots.
		return 0

	// Return the number of digits minus the number of leading zeros.
	return strAsArray.length - strAsArray.findIndex(x => (x !== '0'))
}
module.exports.getSignificantDigits = getSignificantDigits
