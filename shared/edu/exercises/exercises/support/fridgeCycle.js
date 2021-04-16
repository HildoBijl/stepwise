const { getRandomFloatUnit } = require('../../../../inputTypes/FloatUnit')

function getCycle() {
	Tcold = getRandomFloatUnit({
		min: 1,
		max: 8,
		unit: 'dC',
		decimals: 0,
	})
	Twarm = getRandomFloatUnit({
		min: 16,
		max: 25,
		unit: 'dC',
		decimals: 0,
	})
	dTcold = getRandomFloatUnit({
		min: 4,
		max: 12,
		unit: 'dC',
		decimals: 0,
	})
	dTwarm = getRandomFloatUnit({
		min: 6,
		max: 16,
		unit: 'dC',
		decimals: 0,
	})

	Tevap = Tcold.subtract(dTcold)
	Tcond = Twarm.add(dTwarm)

	return { Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}
module.exports.getCycle = getCycle