const { tableInterpolate, inverseTableInterpolate } = require('../../../../util/interpolation')
const { getRandomFloatUnit } = require('../../../../inputTypes/FloatUnit')
const { maximumHumidity } = require('../../../../data/moistureProperties')

function getCycle() {
	// Determine starting and ending temperatures.
	const T1 = getRandomFloatUnit({ // Starting temperature.
		min: 22,
		max: 35,
		unit: 'dC',
		decimals: 0,
	})
	const T4 = getRandomFloatUnit({ // Ending temperature.
		min: 14,
		max: 20,
		unit: 'dC',
		decimals: 0,
	})
	const startAHmax = tableInterpolate(T1, maximumHumidity)
	const endAHmax = tableInterpolate(T4, maximumHumidity)

	// Determine ending humidity.
	const endRH = getRandomFloatUnit({
		min: 0.45,
		max: 0.6,
		unit: '',
	})
	const endAH = endRH.multiply(endAHmax)

	// Determine starting humidity.
	const startAH = getRandomFloatUnit({
		min: Math.min(endAH.number * 1.2, startAHmax.number), // Ensure there's always an option.
		max: startAHmax.number,
		unit: endAH.unit,
	})
	const startRH = startAH.divide(startAHmax).simplify()

	// Determine remaining temperatures.
	const T2 = inverseTableInterpolate(startAH, maximumHumidity) // Temperature when condensation starts.
	const T3 = inverseTableInterpolate(endAH, maximumHumidity) // Temperature after cooling.

	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax }
}
module.exports.getCycle = getCycle