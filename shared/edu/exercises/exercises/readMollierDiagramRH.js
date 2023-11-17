const { tableInterpolate, firstOf, lastOf } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { maximumHumidity } = require('../../../data/moistureProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../eduTools')

const data = {
	skill: 'readMollierDiagram',
	comparison: {
		default: {
			absoluteMargin: 0.04, // 4 percent margin on the relative humidity.
		},
	},
}

function generateState() {
	const temperatureRange = maximumHumidity.headers[0]
	const T = getRandomFloatUnit({
		min: 5, // Limit to higher temperatures to have some resolution in the plot.
		max: lastOf(temperatureRange).number,
		unit: firstOf(temperatureRange).unit,
		decimals: 0,
	})
	const RH = getRandomFloatUnit({
		min: 0.2, // Limit to RH above 20% to not have too low AHs.
		max: 1,
		unit: '',
	})
	const AHmax = tableInterpolate(T, maximumHumidity)
	const AH = RH.multiply(AHmax).setDecimals(0).roundToPrecision()
	return { T, AH }
}

function getSolution({ T, AH }) {
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const RH = AH.divide(AHmax).setUnit('%').setDecimals(0)
	return { T, RH, AHmax, AH }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['RH'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}