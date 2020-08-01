const { isInt } = require('../../../util/numbers')

function isFOofType(param) {
	return typeof param === 'number' && isInt(param)
}
module.exports.isFOofType = isFOofType

function FOtoIO(param) {
	return param.toString()
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(value) {
	if (value === '' || value === '-')
		return 0
	return parseInt(value)
}
module.exports.IOtoFO = IOtoFO

function isEmpty(value) {
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a) === IOtoFO(b)
}
module.exports.equals = equals