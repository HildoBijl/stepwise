const { getRandomInteger } = require('../../../util/random')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')
const { withTemperature } = require('../../../data/steamProperties')
const { gridInterpolate } = require('../../../util/interpolation')

const data = {
	skill: 'lookUpSteamProperties',
	equalityOptions: {
		default: {
			relativeMargin: 0.001,
		},
	},
}

function generateState() {
	const temperatureRange = withTemperature.boilingPressure.headers[0]
	const T = temperatureRange[getRandomInteger(0, Math.min(25, temperatureRange.length))] // Limit to a certain part of the table.
	const type = getRandomInteger(1, 2) // Type 1: liquid line. Type 2: vapor line.
	return { T, type }
}

function getCorrect({ T, type }) {
	// Get pressure.
	const p = gridInterpolate(T, withTemperature.boilingPressure.grid, ...withTemperature.boilingPressure.headers)

	// Get enthalpy.
	const enthalpyTable = type === 1 ? withTemperature.enthalpyLiquid : withTemperature.enthalpyVapor
	h = gridInterpolate(T, enthalpyTable.grid, ...enthalpyTable.headers)

	// Get entropy.
	const entropyTable = type === 1 ? withTemperature.entropyLiquid : withTemperature.entropyVapor
	s = gridInterpolate(T, entropyTable.grid, ...entropyTable.headers)

	return { T, type, p, h, s }
}

function checkInput(state, input) {
	const correct = getCorrect(state)
	return checkParameter(['p', 'h', 's'], correct, input, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}