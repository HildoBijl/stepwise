const { getRandomFloatUnit } = require('../../../../inputTypes/FloatUnit')

function getCycle() {
	const Tcold = getRandomFloatUnit({
		min: 1,
		max: 8,
		unit: 'dC',
		decimals: 0,
	})
	const Twarm = getRandomFloatUnit({
		min: 18,
		max: 25,
		unit: 'dC',
		decimals: 0,
	})
	const dTcold = getRandomFloatUnit({
		min: 4,
		max: 12,
		unit: 'dC',
		decimals: 0,
	})
	const dTwarm = getRandomFloatUnit({
		min: 6,
		max: 16,
		unit: 'dC',
		decimals: 0,
	})

	const Tevap = Tcold.subtract(dTcold)
	const Tcond = Twarm.add(dTwarm)

	return { Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}
module.exports.getCycle = getCycle