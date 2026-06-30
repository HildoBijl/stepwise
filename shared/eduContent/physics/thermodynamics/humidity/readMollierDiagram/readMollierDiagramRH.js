const { first, last } = require('@step-wise/utils')
const { tableInterpolate } = require('@step-wise/interpolation')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { maximumHumidity } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'readMollierDiagram',
	comparison: {
		default: {
			float: {
				absoluteTolerance: 0.04, // 4 percent margin on the relative humidity.
			},
		},
	},
}

function generateState() {
	const temperatureRange = maximumHumidity.inputValues[0]
	const T = getRandomFloatUnit({
		min: 5, // Limit to higher temperatures to have some resolution in the plot.
		max: last(temperatureRange).number,
		unit: first(temperatureRange).unit,
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

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
