const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')
const { maximumHumidity } = require('../../../data/moistureProperties')
const { tableInterpolate, firstOf, lastOf } = require('../../../util')

const data = {
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
	return { T, RH, AHmax, AH }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['AH'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}