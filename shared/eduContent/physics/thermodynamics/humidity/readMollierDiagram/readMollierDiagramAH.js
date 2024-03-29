const { tableInterpolate, firstOf, lastOf } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
const { maximumHumidity } = require('../../../../../data/moistureProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'readMollierDiagram',
	comparison: {
		default: {
			absoluteMargin: 0.0005, // In standard units: kg/kg.
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
		min: 20, // Limit to RH above 20% to not have too low AHs.
		max: 100,
		decimals: 0,
		unit: '%',
	})
	return { T, RH }
}

function getSolution({ T, RH }) {
	RH = RH.simplify()
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const AH = RH.multiply(AHmax)
	return { AHmax, AH }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'AH')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
