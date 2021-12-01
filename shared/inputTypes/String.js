const { isNumber } = require('../util/numbers')

function isFOofType(str) {
	return typeof str === 'string' && !isNumber(str)
}
module.exports.isFOofType = isFOofType

function FOtoIO(str) {
	return str
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(str) {
	// Check for legacy cases. Previously strings were stored as { type: 'String', value: { value: 'the actual string' } }. It was rather dumb. Check if this is in that old format.
	if (str.value !== undefined)
		return str.value

	// Normal case.
	return str
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return ''
}
module.exports.getEmpty = getEmpty

function isEmpty(str) {
	// Check for legacy cases. (See above.)
	if (str.value !== undefined)
		return isEmpty(str.value)

	// Normal case.
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return a === b
}
module.exports.equals = equals