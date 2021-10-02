const { getRandomBoolean } = require('../util/random')

module.exports.getRandomBoolean = getRandomBoolean // Exports this function here too, for uniformity's sake.

function isFOofType(bool) {
	return typeof bool === 'boolean'
}
module.exports.isFOofType = isFOofType

function FOtoIO(bool) {
	return bool
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(bool) {
	return bool
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return false
}
module.exports.getEmpty = getEmpty

function isEmpty(value) {
	return false // Never empty.
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return IOtoFO(a) === IOtoFO(b)
}
module.exports.equals = equals