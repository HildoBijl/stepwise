const { getRandomFloat, getRandomExponentialFloat } = require('../Float')

// getRandomFloatUnit gives a random Float with given Unit.
function getRandomFloatUnit(options) {
	return new FloatUnit({
		float: getRandomFloat(options),
		unit: options.unit,
	})
}
module.exports.getRandomFloatUnit = getRandomFloatUnit

// getRandomExponentialFloatUnit gives a random Float according to an exponential distribution with given Unit.
function getRandomExponentialFloatUnit(options) {
	return new FloatUnit({
		float: getRandomExponentialFloat(options),
		unit: options.unit,
	})
}
module.exports.getRandomExponentialFloatUnit = getRandomExponentialFloatUnit
