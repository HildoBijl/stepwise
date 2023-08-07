const { isNumber, ensureNumber } = require('../numbers')

// ensureArray checks whether a variable is an array and throws an error if not. If all is fine, the same parameter is returned.
function ensureArray(array) {
	if (!Array.isArray(array))
		throw new Error(`Input error: expected an array but received an object of type "${typeof array}".`)
	return array
}
module.exports.ensureArray = ensureArray

// isNumberArray checks whether a variable is an array filled with numbers.
function isNumberArray(array) {
	return Array.isArray(array) && array.every(value => isNumber(value))
}
module.exports.isNumberArray = isNumberArray

// ensureNumberArray checks whether a variable is an array filled with numbers. It can be given the same extra options as ensureNumber.
function ensureNumberArray(array, ...args) {
	array = ensureArray(array)
	array = array.map(v => ensureNumber(v, ...args))
	return array
}
module.exports.ensureNumberArray = ensureNumberArray

// hasDuplicates checks if an array has duplicates. Optionally, an equals function can be defined.
function hasDuplicates(array, equals = (a, b) => a === b) {
	const duplicate = array.find((x, index) => {
		return array.find((y, index2) => {
			return index < index2 && equals(x, y)
		})
	})
	return duplicate !== undefined
}
module.exports.hasDuplicates = hasDuplicates
