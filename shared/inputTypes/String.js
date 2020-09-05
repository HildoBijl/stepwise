const { isNumber } = require('../util/numbers')

function isFOofType(param) {
	return typeof param === 'string' && !isNumber(param)
}
module.exports.isFOofType = isFOofType

function FOtoIO(param) {
	return param
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	return value
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return ''
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return a === b
}
module.exports.equals = equals