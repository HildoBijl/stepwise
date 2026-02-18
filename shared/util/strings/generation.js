const { ensureInt } = require('../numbers')

const { alphabet } = require('./checks')

function toExcelColumn(num) {
	num = ensureInt(num, true)

	// Check boundary cases.
	if (num === 0)
		return ''

	// Extract the last digit.
	const lastDigitIndex = (num - 1) % alphabet.length
	const lastDigit = alphabet[lastDigitIndex]

	// Recursively get the earlier ones.
	const earlierDigits = toExcelColumn((num - lastDigitIndex - 1) / alphabet.length)
	return earlierDigits + lastDigit
}
module.exports.toExcelColumn = toExcelColumn
