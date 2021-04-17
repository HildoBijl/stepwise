const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')
const { maximumHumidity } = require('../../../data/moistureProperties')
const { tableInterpolate } = require('../../../util/interpolation')
const { firstOf, lastOf } = require('../../../util/arrays')

const data = {
	skill: 'readMollierDiagram',
	equalityOptions: {
		default: {},
	},
}

function generateState() {
	const temperatureRange = maximumHumidity.headers[0]
	const T = getRandomFloatUnit({
		min: 0, // Limit to temperatures above zero to have some resolution in the plot.
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

function getCorrect({ T, RH }) {
	RH = RH.simplify()
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const AH = RH.multiply(AHmax).setDecimals(0)
	return { T, RH, AHmax, AH }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['AH'], correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}