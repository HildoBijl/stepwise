const { getRandomInteger, tableInterpolate } = require('../../util')
const { withTemperature } = require('../../data/steamProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../eduTools')

const data = {
	skill: 'lookUpSteamProperties',
	comparison: {
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

function getSolution({ T, type }) {
	// Get pressure.
	const p = tableInterpolate(T, withTemperature.boilingPressure)

	// Get enthalpy.
	const h = tableInterpolate(T, type === 1 ? withTemperature.enthalpyLiquid : withTemperature.enthalpyVapor)

	// Get entropy.
	const s = tableInterpolate(T, type === 1 ? withTemperature.entropyLiquid : withTemperature.entropyVapor)

	return { T, type, p, h, s }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['p', 'h', 's'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}