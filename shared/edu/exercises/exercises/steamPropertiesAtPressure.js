const { getRandomInteger } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')
const { withPressure } = require('../../../data/steamProperties')
const { tableInterpolate } = require('../../../util/interpolation')

const data = {
	skill: 'lookUpSteamProperties',
	equalityOptions: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

function generateState() {
	const pressureRange = withPressure.boilingTemperature.headers[0]
	const p = pressureRange[getRandomInteger(0, Math.min(25, pressureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { p, type }
}

function getCorrect({ p, type }) {
	// Get pressure.
	const T = tableInterpolate(p, withPressure.boilingTemperature)

	// Get enthalpy.
	h = tableInterpolate(p, type === 1 ? withPressure.enthalpyLiquid : withPressure.enthalpyVapor)

	// Get entropy.
	s = tableInterpolate(p, type === 1 ? withPressure.entropyLiquid : withPressure.entropyVapor)

	return { p, type, T, h, s }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['T', 'h', 's'], correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}