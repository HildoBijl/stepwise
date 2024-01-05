const { tableInterpolate, firstOf, lastOf } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { maximumHumidity } = require('../../../../../data/moistureProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
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
	return { AHmax, RH }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'RH')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
