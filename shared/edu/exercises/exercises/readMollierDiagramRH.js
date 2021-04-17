const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')
const { maximumHumidity } = require('../../../data/moistureProperties')
const { tableInterpolate } = require('../../../util/interpolation')
const { firstOf, lastOf } = require('../../../util/arrays')

const data = {
	skill: 'readMollierDiagram',
	equalityOptions: {
		default: {
			absoluteMargin: 4, // 4 percent margin on the relative humidity.
		},
	},
}

function generateState() {
	const temperatureRange = maximumHumidity.headers[0]
	const T = getRandomFloatUnit({
		min: 5, // Limit to none-low temperatures to have some resolution in the plot.
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

function getCorrect({ T, AH }) {
	const AHmax = tableInterpolate(T, maximumHumidity).setSignificantDigits(2)
	const RH = AH.divide(AHmax).setUnit('%').setDecimals(0)
	return { T, RH, AHmax, AH }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['RH'], correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}