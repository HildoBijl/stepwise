const { floatFormat } = require('../Float/util')

// const inputFormat = new RegExp(`^(?<float>${floatFormat})(?<unit>.*)$`) // Firefox doesn't support named capture groups.
const inputFormat = new RegExp(`^(${floatFormat}(.*))$`)

// splitString turns a string representation of (hopefully) a FloatUnit into two strings, returning them as an object { float: "...", unit: "..." }.
function splitString(str) {
	// Check boundary cases.
	str = str.trim()
	if (str === '')
		return {}

	// Check if the string has the required format.
	let match = inputFormat.exec(str)
	if (!match)
		throw new Error(`Invalid FloatUnit number given: could not parse "${str}". It did not have the required format of "xxx.xxxx * 10^(yy) [units]".`)

	// Further process and save the results.
	return {
		float: match[2],
		unit: match[22],
	}
}
module.exports.splitString = splitString
